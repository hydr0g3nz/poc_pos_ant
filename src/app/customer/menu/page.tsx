// src/app/customer/menu/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Spin,
  Empty,
  Space,
  Tag,
  Affix,
  Badge,
  Drawer,
  InputNumber,
  message,
  Modal,
  Radio,
  Checkbox,
  Divider,
  Input,
  Select,
  Form,
  Alert,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  CoffeeOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { useSearchParams, useRouter } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { useOrderSubmit } from "@/hooks/useOrderSubmit";
import { useMenuSelection } from "@/hooks/useMenuSelection";
import { MenuUtils } from "@/utils/utils";
import { MenuItem, CartItem, SelectedOption } from "@/types";

const { Title, Paragraph } = Typography;

// Constants
const CONSTANTS = {
  ITEMS_PER_PAGE: 12,
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
  CARD_HEIGHT: 192, // 48 * 4 = h-48
} as const;

// Types for form values
interface MenuFilterForm {
  search?: string;
  category?: number;
}

interface MenuOptionForm {
  quantity: number;
  options: Record<number, number | number[]>;
  specialNote?: string;
}

// Memoized Components
const SearchAndFilter = React.memo(
  ({
    menu,
    onFilterChange,
  }: {
    menu: any;
    onFilterChange: (values: MenuFilterForm) => void;
  }) => {
    const [form] = Form.useForm<MenuFilterForm>();

    const handleValuesChange = useCallback(
      (_, allValues: MenuFilterForm) => {
        onFilterChange(allValues);
      },
      [onFilterChange]
    );

    return (
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <Form
          form={form}
          onValuesChange={handleValuesChange}
          initialValues={{ search: "", category: undefined }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Form.Item name="search" className="mb-0">
                <Input.Search
                  placeholder="ค้นหาเมนูอาหาร..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  aria-label="ค้นหาเมนูอาหาร"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="category" className="mb-0">
                <Select
                  placeholder="เลือกหมวดหมู่"
                  allowClear
                  size="large"
                  className="w-full"
                  aria-label="เลือกหมวดหมู่อาหาร"
                  options={menu.categories?.map((cat: any) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Button
                size="large"
                onClick={() => form.resetFields()}
                aria-label="ล้างตัวกรอง"
              >
                ล้างตัวกรอง
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
);

const MenuItemCard = React.memo(
  ({
    item,
    onItemClick,
    isLoading,
  }: {
    item: MenuItem;
    onItemClick: (item: MenuItem) => void;
    isLoading: boolean;
  }) => {
    const handleClick = useCallback(() => {
      onItemClick(item);
    }, [item, onItemClick]);

    return (
      <Card
        hoverable
        className="h-full transition-all duration-200 hover:shadow-lg"
        cover={
          <div
            className="bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center"
            style={{ height: CONSTANTS.CARD_HEIGHT }}
            role="img"
            aria-label={`รูปภาพของ ${item.name}`}
          >
            <CoffeeOutlined className="text-4xl text-orange-500" />
          </div>
        }
        actions={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleClick}
            loading={isLoading}
            disabled={isLoading}
            aria-label={`เลือกเมนู ${item.name}`}
          >
            เลือกเมนู
          </Button>,
        ]}
      >
        <Card.Meta
          title={
            <Space direction="vertical" className="w-full">
              <div className="font-semibold text-lg">{item.name}</div>
              <div className="flex flex-wrap gap-1">
                {item.category && <Tag color="orange">{item.category}</Tag>}
                {MenuUtils.hasOptions(item) && (
                  <Tag color="blue">
                    มีตัวเลือก ({item.menu_option?.length})
                  </Tag>
                )}
                {item.is_recommended && <Tag color="gold">แนะนำ</Tag>}
              </div>
            </Space>
          }
          description={
            <Space direction="vertical" className="w-full">
              <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600 mb-2">
                {item.description || "อาหารอร่อย รสชาติเยี่ยม"}
              </Paragraph>
              <div className="text-xl font-bold text-orange-600">
                ฿{item.price?.toLocaleString()}
              </div>
            </Space>
          }
        />
      </Card>
    );
  }
);

const MenuGrid = React.memo(
  ({
    menu,
    onItemClick,
    isLoading,
  }: {
    menu: any;
    onItemClick: (item: MenuItem) => void;
    isLoading: boolean;
  }) => (
    <Spin spinning={menu.isLoading} tip="กำลังโหลดเมนู...">
      {menu.menuItems?.items && menu.menuItems.items.length > 0 ? (
        <Row gutter={[16, 16]}>
          {menu.menuItems.items.map((item: MenuItem) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <MenuItemCard
                item={item}
                onItemClick={onItemClick}
                isLoading={isLoading}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ไม่พบเมนูที่ค้นหา"
        />
      )}
    </Spin>
  )
);

// Form-based Option Selector
const OptionFormGroup = React.memo(
  ({ menuOption, form }: { menuOption: any; form: any }) => {
    const optionId = menuOption.option?.id;
    const isRequired = menuOption.option?.isRequired;
    const isSingle = menuOption.option?.type === "single";

    const validationRules = useMemo(
      () => [
        ...(isRequired
          ? [
              {
                required: true,
                message: `กรุณาเลือก${menuOption.option?.name}`,
              },
            ]
          : []),
      ],
      [isRequired, menuOption.option?.name]
    );

    return (
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Title level={5} className="mb-0 mr-2">
            {menuOption.option?.name}
          </Title>
          {isRequired && <Tag color="red">บังคับเลือก</Tag>}
          <Tag color={isSingle ? "blue" : "green"}>
            {isSingle ? "เลือกได้ 1 ตัวเลือก" : "เลือกได้หลายตัวเลือก"}
          </Tag>
        </div>

        <Form.Item
          name={["options", optionId]}
          rules={validationRules}
          className="mb-0"
        >
          {isSingle ? (
            <Radio.Group
              options={menuOption.option?.optionValues.map((value: any) => ({
                label: (
                  <div className="flex justify-between items-center w-96">
                    <span>{value.name}</span>
                    <span className="ml-4">
                      {parseFloat(value.additionalPrice) > 0 ? (
                        <span className="text-green-600">
                          +฿{parseFloat(value.additionalPrice).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">ฟรี</span>
                      )}
                    </span>
                  </div>
                ),
                value: value.id,
              }))}
            />
          ) : (
            <Checkbox.Group>
              <Space direction="vertical">
                {menuOption.option?.optionValues.map((value: any) => (
                  <Checkbox key={value.id} value={value.id}>
                    <div className="flex justify-between items-center w-96">
                      <span>{value.name}</span>
                      <span className="ml-4">
                        {parseFloat(value.additionalPrice) > 0 ? (
                          <span className="text-green-600">
                            +฿
                            {parseFloat(value.additionalPrice).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">ฟรี</span>
                        )}
                      </span>
                    </div>
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        </Form.Item>
      </div>
    );
  }
);

// Price Calculator Component
const PriceCalculator = React.memo(
  ({
    basePrice,
    form,
    selectedItem,
  }: {
    basePrice: number;
    form: any;
    selectedItem: MenuItem;
  }) => {
    const watchedValues = Form.useWatch([], form);

    const calculatedPrice = useMemo(() => {
      if (!watchedValues?.options || !selectedItem?.menu_option)
        return basePrice;

      let additionalPrice = 0;
      const options = watchedValues.options;

      selectedItem.menu_option.forEach((menuOption: any) => {
        const optionId = menuOption.option?.id;
        const selectedValue = options[optionId];

        if (selectedValue) {
          if (Array.isArray(selectedValue)) {
            // Multiple selection
            selectedValue.forEach((valueId: number) => {
              const value = menuOption.option?.optionValues.find(
                (v: any) => v.id === valueId
              );
              if (value) {
                additionalPrice += parseFloat(value.additionalPrice || "0");
              }
            });
          } else {
            // Single selection
            const value = menuOption.option?.optionValues.find(
              (v: any) => v.id === selectedValue
            );
            if (value) {
              additionalPrice += parseFloat(value.additionalPrice || "0");
            }
          }
        }
      });

      return basePrice + additionalPrice;
    }, [basePrice, watchedValues?.options, selectedItem?.menu_option]);

    const quantity = watchedValues?.quantity || 1;
    const totalPrice = calculatedPrice * quantity;

    return (
      <div className="bg-gray-50 p-3 rounded">
        <div className="flex justify-between text-sm text-gray-600">
          <span>ราคาพื้นฐาน:</span>
          <span>฿{basePrice.toLocaleString()}</span>
        </div>
        {calculatedPrice > basePrice && (
          <div className="flex justify-between text-sm text-green-600">
            <span>ตัวเลือกเพิ่มเติม:</span>
            <span>+฿{(calculatedPrice - basePrice).toLocaleString()}</span>
          </div>
        )}
        <Divider className="my-2" />
        <div className="flex justify-between font-medium">
          <span>รวมต่อชิ้น:</span>
          <span>฿{calculatedPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-orange-600">
          <span>รวมทั้งหมด:</span>
          <span>฿{totalPrice.toLocaleString()}</span>
        </div>
      </div>
    );
  }
);

// Modal Content with Form
const OptionsModalContent = React.memo(
  ({
    selectedItem,
    onSubmit,
    form,
  }: {
    selectedItem: MenuItem;
    onSubmit: (values: MenuOptionForm) => void;
    form: any;
  }) => {
    if (!selectedItem) return null;

    return (
      <Form
        form={form}
        onFinish={onSubmit}
        initialValues={{
          quantity: CONSTANTS.MIN_QUANTITY,
          options: {},
          specialNote: "",
        }}
      >
        <div className="mb-4">
          <div
            className="w-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center rounded mb-4"
            style={{ height: CONSTANTS.CARD_HEIGHT }}
          >
            <CoffeeOutlined className="text-4xl text-orange-500" />
          </div>
          <Title level={4}>{selectedItem.name}</Title>
          <Paragraph>{selectedItem.description}</Paragraph>
          <div className="text-xl font-bold text-orange-600 mb-4">
            ฿{selectedItem.price.toLocaleString()}
          </div>
        </div>

        <div className="mb-4">
          <label className="font-medium">จำนวน: </label>
          <Form.Item
            name="quantity"
            rules={[
              { required: true, message: "กรุณาระบุจำนวน" },
              {
                type: "number",
                min: CONSTANTS.MIN_QUANTITY,
                max: CONSTANTS.MAX_QUANTITY,
              },
            ]}
            className="inline-block ml-2 mb-0"
          >
            <InputNumber
              min={CONSTANTS.MIN_QUANTITY}
              max={CONSTANTS.MAX_QUANTITY}
              aria-label="จำนวนที่ต้องการสั่ง"
            />
          </Form.Item>
        </div>

        <Divider />

        {selectedItem.menu_option?.length > 0 ? (
          selectedItem.menu_option.map((menuOption: any, index: number) => (
            <OptionFormGroup
              key={menuOption.option?.id || index}
              menuOption={menuOption}
              form={form}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            เมนูนี้ไม่มีตัวเลือกเพิ่มเติม
          </div>
        )}

        <Divider />

        <div className="mb-4">
          <Form.Item name="specialNote" label="หมายเหตุพิเศษ" className="mb-0">
            <Input.TextArea
              rows={2}
              placeholder="เช่น ไม่เผ็ด, ไม่ใส่หัวหอม"
              maxLength={200}
              showCount
              aria-label="หมายเหตุพิเศษสำหรับเมนูนี้"
            />
          </Form.Item>
        </div>

        <PriceCalculator
          basePrice={selectedItem.price}
          form={form}
          selectedItem={selectedItem}
        />
      </Form>
    );
  }
);

// Cart Item with optimistic updates
const CartItemComponent = React.memo(
  ({
    item,
    index,
    onUpdateQuantity,
    onRemove,
  }: {
    item: CartItem;
    index: number;
    onUpdateQuantity: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
  }) => {
    const handleQuantityChange = useCallback(
      (quantity: number) => {
        if (quantity <= 0) {
          onRemove(index);
        } else {
          onUpdateQuantity(index, quantity);
        }
      },
      [index, onUpdateQuantity, onRemove]
    );

    const optionsPrice = useMemo(
      () => MenuUtils.calculateOptionsPrice(item.selectedOptions || []),
      [item.selectedOptions]
    );

    return (
      <Card className="mb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-medium">{item.name}</div>
            <div className="text-gray-500">
              ฿{(item.price / item.quantity).toLocaleString()} x {item.quantity}
            </div>
            {item.optionsText && (
              <div className="text-xs text-gray-500 mt-1">
                {item.optionsText}
              </div>
            )}
            {optionsPrice > 0 && (
              <div className="text-xs text-green-600">
                +฿{optionsPrice.toLocaleString()}
              </div>
            )}
            {item.specialNote && (
              <div className="text-xs text-blue-600 mt-1">
                หมายเหตุ: {item.specialNote}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                icon={<MinusOutlined />}
                size="small"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                aria-label="ลดจำนวน"
              />
              <InputNumber
                min={1}
                max={CONSTANTS.MAX_QUANTITY}
                value={item.quantity}
                onChange={(value) => handleQuantityChange(value || 1)}
                className="w-16"
                size="small"
              />
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                aria-label="เพิ่มจำนวน"
              />
            </div>
            <div className="text-orange-600 font-medium">
              ฿{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

const CartDrawerContent = React.memo(
  ({
    cart,
    onCheckout,
    isSubmitting,
  }: {
    cart: any;
    onCheckout: () => void;
    isSubmitting: boolean;
  }) => {
    const handleUpdateQuantity = useCallback(
      (index: number, quantity: number) => {
        cart.updateQuantity(index, quantity);
      },
      [cart]
    );

    const handleRemoveItem = useCallback(
      (index: number) => {
        cart.removeItem(index);
      },
      [cart]
    );

    return (
      <>
        {!cart.summary.isEmpty ? (
          <Space direction="vertical" className="w-full">
            {cart.items.map((item: CartItem, index: number) => (
              <CartItemComponent
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </Space>
        ) : (
          <Empty description="ไม่มีสินค้าในตะกร้า" />
        )}
      </>
    );
  }
);

const FloatingCartButton = React.memo(
  ({ cart, onOpenDrawer }: { cart: any; onOpenDrawer: () => void }) => (
    <Affix offsetBottom={20}>
      <div className="flex justify-end">
        <Badge count={cart.summary.totalQuantity} showZero={false}>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={onOpenDrawer}
            className="shadow-lg"
            aria-label={`เปิดตะกร้าสินค้า มีสินค้า ${cart.summary.totalQuantity} รายการ`}
          >
            ตะกร้า {cart.summary.formattedPrice}
          </Button>
        </Badge>
      </div>
    </Affix>
  )
);

// Main Component
export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isItemLoading, setIsItemLoading] = useState(false);

  // Hooks
  const menu = useMenu({ isAdmin: false, limit: CONSTANTS.ITEMS_PER_PAGE });
  const cart = useCart();
  const orderSubmit = useOrderSubmit();
  const menuSelection = useMenuSelection(false);
  // Form
  const [optionForm] = Form.useForm<MenuOptionForm>();

  // Initialize category from URL params
  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam && !isNaN(Number(categoryParam))) {
      menu.filterByCategory(Number(categoryParam));
    }
  }, [searchParams, menu.filterByCategory]);

  // Handlers
  const handleFilterChange = useCallback(
    (values: MenuFilterForm) => {
      if (values.search !== undefined) {
        menu.search(values.search);
      }
      if (values.category !== undefined) {
        menu.filterByCategory(values.category);
      }
    },
    [menu.search, menu.filterByCategory]
  );

  const handleItemClick = useCallback(
    async (item: MenuItem) => {
      setIsItemLoading(true);
      try {
        const itemSelected = await menuSelection.selectMenuItem(item);
        if (!itemSelected) return;

        setSelectedItem(itemSelected);

        if (MenuUtils.hasOptions(itemSelected)) {
          setIsModalVisible(true);
          optionForm.resetFields();
        } else {
          // Add to cart directly with optimistic update
          cart.addItem(item, [], 1);
          message.success(`เพิ่ม ${itemSelected.name} ลงตะกร้าแล้ว`);
        }
      } catch (error) {
        message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียดเมนู");
      } finally {
        setIsItemLoading(false);
      }
    },
    [cart, optionForm]
  );

  const handleModalSubmit = useCallback(
    (values: MenuOptionForm) => {
      if (!selectedItem) return;

      try {
        // Transform form values to cart format
        const selectedOptions: SelectedOption[] = [];

        if (values.options && selectedItem.menu_option) {
          selectedItem.menu_option.forEach((menuOption: any) => {
            const optionId = menuOption.option?.id;
            const selectedValue = values.options[optionId];

            if (selectedValue) {
              if (Array.isArray(selectedValue)) {
                selectedValue.forEach((valueId: number) => {
                  const value = menuOption.option?.optionValues.find(
                    (v: any) => v.id === valueId
                  );
                  if (value) {
                    selectedOptions.push({
                      optionId,
                      valueId,
                      additionalPrice: parseFloat(value.additionalPrice || "0"),
                    });
                  }
                });
              } else {
                const value = menuOption.option?.optionValues.find(
                  (v: any) => v.id === selectedValue
                );
                if (value) {
                  selectedOptions.push({
                    optionId,
                    valueId: selectedValue,
                    additionalPrice: parseFloat(value.additionalPrice || "0"),
                  });
                }
              }
            }
          });
        }

        // Add to cart with optimistic update
        cart.addItem(
          selectedItem,
          selectedOptions,
          values.quantity,
          values.specialNote
        );

        message.success(`เพิ่ม ${selectedItem.name} ลงตะกร้าแล้ว`);
        setIsModalVisible(false);
        setSelectedItem(null);
      } catch (error) {
        message.error("เกิดข้อผิดพลาดในการเพิ่มลงตะกร้า");
      }
    },
    [selectedItem, cart]
  );

  const handleCheckout = useCallback(async () => {
    if (cart.summary.isEmpty) {
      message.warning("กรุณาเลือกรายการอาหารก่อน");
      return;
    }

    try {
      // Get order ID from QR scan or create new order
      // const orderId = await orderSubmit.getOrCreateOrderId();

      const result = await orderSubmit.submitOrder(5, cart.items);

      if (result.success) {
        cart.clearCart();
        setIsDrawerVisible(false);
        message.success("สั่งอาหารสำเร็จ!");

        // Navigate to order tracking
        if (result.orderId) {
          router.push(`/customer/orders/${result.orderId}`);
        }
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  }, [cart, orderSubmit, router]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setSelectedItem(null);
    optionForm.resetFields();
  }, [optionForm]);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerVisible(false);
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setIsDrawerVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Title level={1}>เมนูอาหาร</Title>
          <Paragraph>เลือกอาหารและเครื่องดื่มที่คุณชื่นชอบ</Paragraph>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter menu={menu} onFilterChange={handleFilterChange} />

        {/* Menu Items */}
        <MenuGrid
          menu={menu}
          onItemClick={handleItemClick}
          isLoading={isItemLoading}
        />

        {/* Options Modal */}
        <Modal
          title={`เลือกตัวเลือกสำหรับ ${selectedItem?.name || ""}`}
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={[
            <Button key="cancel" onClick={handleModalCancel}>
              ยกเลิก
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => optionForm.submit()}
              loading={isItemLoading}
            >
              เพิ่มลงตะกร้า
            </Button>,
          ]}
          width={600}
          destroyOnClose
        >
          {selectedItem && (
            <OptionsModalContent
              selectedItem={selectedItem}
              onSubmit={handleModalSubmit}
              form={optionForm}
            />
          )}
        </Modal>

        {/* Floating Cart Button */}
        <FloatingCartButton cart={cart} onOpenDrawer={handleDrawerOpen} />

        {/* Cart Drawer */}
        <Drawer
          title={`ตะกร้าสินค้า (${cart.summary.totalQuantity} รายการ)`}
          placement="right"
          size="large"
          onClose={handleDrawerClose}
          open={isDrawerVisible}
          footer={
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">
                รวม: {cart.summary.formattedPrice}
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleCheckout}
                disabled={cart.summary.isEmpty}
                loading={orderSubmit.isSubmitting}
                aria-label={`สั่งอาหาร ${cart.summary.totalQuantity} รายการ`}
              >
                สั่งอาหาร ({cart.summary.totalQuantity} รายการ)
              </Button>
            </div>
          }
        >
          <CartDrawerContent
            cart={cart}
            onCheckout={handleCheckout}
            isSubmitting={orderSubmit.isSubmitting}
          />
        </Drawer>
      </div>
    </div>
  );
}
