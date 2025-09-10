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
  Badge,
  Drawer,
  InputNumber,
  message,
  Modal,
  Radio,
  Checkbox,
  Divider,
  Input,
  Form,
  Tabs,
  FloatButton,
  Layout,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { useOrderSubmit } from "@/hooks/useOrderSubmit";
import { useMenuSelection } from "@/hooks/useMenuSelection";
import { MenuUtils } from "@/utils/utils";
import { MenuItem, CartItem, SelectedOption } from "@/types";
import Image from "next/image";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

// Constants
const CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
} as const;

// Mobile Header Component
const MobileHeader = React.memo(
  ({
    onCartClick,
    cartCount,
    onBackClick,
  }: {
    onCartClick: () => void;
    cartCount: number;
    onBackClick?: () => void;
  }) => {
    return (
      <Header className="bg-white shadow-sm px-4 flex items-center justify-between sticky top-0 z-90 h-14">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined className="!text-orange-500" />}
              onClick={onBackClick}
              size="small"
            />
          )}
          <h1 className="text-lg font-bold text-orange-500 m-0">Luna HDY</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge count={cartCount} showZero={false} size="small">
            <Button
              type="text"
              icon={<ShoppingCartOutlined className="!text-orange-500" />}
              onClick={onCartClick}
              size="large"
            />
          </Badge>
        </div>
      </Header>
    );
  }
);

// Horizontal Mobile Menu Card สำหรับ List Layout
const MobileMenuCard = React.memo(
  ({
    item,
    onItemClick,
  }: {
    item: MenuItem;
    onItemClick: (item: MenuItem) => void;
  }) => {
    const handleClick = useCallback(() => {
      onItemClick(item);
    }, [item, onItemClick]);

    return (
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        {/* Image Container - Left Side */}
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-600 to-orange-700 p-2 flex-shrink-0">
          <div className="bg-white/90 rounded-lg h-full flex items-center justify-center">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center">
                <div className="text-2xl">🥤</div>
              </div>
            )}
          </div>
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-orange-600">
              ฿{item.price?.toFixed(2)}
            </span>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }
);

// Simplified Category Tabs
const CategoryTabs = React.memo(
  ({
    categories,
    activeCategory,
    onCategoryChange,
  }: {
    categories?: any[];
    activeCategory?: number;
    onCategoryChange: (categoryId?: number) => void;
  }) => {
    if (!categories) {
      return null;
    }
    return (
      <div className="bg-white sticky top-14 z-40 border-b">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 p-3 min-w-max">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => onCategoryChange(undefined)}
            >
              ทั้งหมด
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => onCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

// Options Modal ยังคงเหมือนเดิม
const MobileOptionsModal = React.memo(
  ({
    selectedItem,
    visible,
    onClose,
    onSubmit,
  }: {
    selectedItem: MenuItem | null;
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
  }) => {
    const [form] = Form.useForm();
    const [quantity, setQuantity] = useState(1);

    const watchedValues = Form.useWatch([], form);

    const calculatedPrice = useMemo(() => {
      if (!selectedItem) return 0;
      let price = selectedItem.price;

      if (watchedValues?.options && selectedItem.menu_option) {
        selectedItem.menu_option.forEach((menuOption: any) => {
          const optionId = menuOption.option?.id;
          const selectedValue = watchedValues.options[optionId];

          if (selectedValue) {
            if (Array.isArray(selectedValue)) {
              selectedValue.forEach((valueId: number) => {
                const value = menuOption.option?.optionValues.find(
                  (v: any) => v.id === valueId
                );
                if (value) {
                  price += parseFloat(value.additionalPrice || "0");
                }
              });
            } else {
              const value = menuOption.option?.optionValues.find(
                (v: any) => v.id === selectedValue
              );
              if (value) {
                price += parseFloat(value.additionalPrice || "0");
              }
            }
          }
        });
      }

      return price * quantity;
    }, [selectedItem, quantity, watchedValues]);

    useEffect(() => {
      if (visible && selectedItem) {
        form.resetFields();
        setQuantity(1);
      }
    }, [visible, selectedItem, form]);

    const handleSubmit = () => {
      form.validateFields().then((values) => {
        onSubmit({ ...values, quantity });
      });
    };

    if (!selectedItem) return null;

    return (
      <Drawer
        title={null}
        placement="bottom"
        onClose={onClose}
        open={visible}
        height="90vh"
        closable={false}
        className="rounded-t-3xl"
        styles={{
          body: { padding: 0, height: "calc(90vh - 60px)" },
        }}
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-4 bg-white">
            <div className="flex justify-end mb-2">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                shape="circle"
              />
            </div>

            <div className="text-center">
              <div className="text-6xl mb-3">🥤</div>
              <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {selectedItem.description}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <Form form={form} layout="vertical">
              {selectedItem.menu_option?.map((menuOption: any) => (
                <Form.Item
                  key={menuOption.option?.id}
                  name={["options", menuOption.option?.id]}
                  label={
                    <span className="font-medium">
                      {menuOption.option?.name}
                      {menuOption.option?.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  }
                  rules={[
                    {
                      required: menuOption.option?.isRequired,
                      message: `กรุณาเลือก${menuOption.option?.name}`,
                    },
                  ]}
                  className="mb-6"
                >
                  {menuOption.option?.type === "single" ? (
                    <Radio.Group className="w-full">
                      <Space
                        direction="vertical"
                        className="w-full"
                        size="middle"
                      >
                        {menuOption.option?.optionValues.map((value: any) => (
                          <div
                            key={value.id}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                          >
                            <Radio value={value.id} className="w-full">
                              <div className="flex justify-between items-center w-full">
                                <span className="flex-1">{value.name}</span>
                                {parseFloat(value.additionalPrice) > 0 && (
                                  <span className="text-green-600 font-medium">
                                    +฿
                                    {parseFloat(value.additionalPrice).toFixed(
                                      2
                                    )}
                                  </span>
                                )}
                              </div>
                            </Radio>
                          </div>
                        ))}
                      </Space>
                    </Radio.Group>
                  ) : (
                    <Checkbox.Group className="w-full">
                      <Space
                        direction="vertical"
                        className="w-full"
                        size="middle"
                      >
                        {menuOption.option?.optionValues.map((value: any) => (
                          <div
                            key={value.id}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                          >
                            <Checkbox value={value.id} className="w-full">
                              <div className="flex justify-between items-center w-full">
                                <span className="flex-1">{value.name}</span>
                                {parseFloat(value.additionalPrice) > 0 && (
                                  <span className="text-green-600 font-medium">
                                    +฿
                                    {parseFloat(value.additionalPrice).toFixed(
                                      2
                                    )}
                                  </span>
                                )}
                              </div>
                            </Checkbox>
                          </div>
                        ))}
                      </Space>
                    </Checkbox.Group>
                  )}
                </Form.Item>
              ))}

              <Form.Item
                name="specialNote"
                label="หมายเหตุพิเศษ"
                className="mb-6"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="เช่น ไม่เผ็ด, ไม่ใส่น้ำแข็ง"
                  className="resize-none"
                />
              </Form.Item>

              <div className="h-20"></div>
            </Form>
          </div>

          <div className="flex-shrink-0 bg-white border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  shape="circle"
                  icon={<MinusOutlined />}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  size="large"
                />
                <span className="font-semibold text-lg w-8 text-center">
                  {quantity}
                </span>
                <Button
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={() => setQuantity(quantity + 1)}
                  size="large"
                />
              </div>

              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                className="flex-1 ml-4 h-12 text-base font-medium"
              >
                เพิ่มลงตะกร้า ฿{calculatedPrice.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    );
  }
);

// Cart Drawer ยังคงเหมือนเดิม
const MobileCartDrawer = React.memo(
  ({
    visible,
    onClose,
    cart,
    onCheckout,
    isSubmitting,
  }: {
    visible: boolean;
    onClose: () => void;
    cart: any;
    onCheckout: () => void;
    isSubmitting: boolean;
  }) => {
    return (
      <Drawer
        title="ตะกร้าสินค้า"
        placement="bottom"
        onClose={onClose}
        open={visible}
        height="70%"
        footer={
          <div className="p-4 bg-white border-t">
            <div className="flex justify-between mb-3">
              <span className="font-medium">รวมทั้งหมด</span>
              <span className="text-xl font-bold text-orange-600">
                {cart.summary.formattedPrice}
              </span>
            </div>
            <Button
              type="primary"
              block
              size="large"
              onClick={onCheckout}
              loading={isSubmitting}
              disabled={cart.summary.isEmpty}
              className="h-12"
            >
              สั่งอาหาร
            </Button>
          </div>
        }
      >
        {cart.items.length > 0 ? (
          <div className="space-y-3">
            {cart.items.map((item: CartItem, index: number) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.optionsText && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.optionsText}
                      </p>
                    )}
                    <div className="text-orange-600 font-medium mt-2">
                      ฿{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      shape="circle"
                      icon={<MinusOutlined />}
                      onClick={() =>
                        cart.updateQuantity(index, item.quantity - 1)
                      }
                    />
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="small"
                      shape="circle"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        cart.updateQuantity(index, item.quantity + 1)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="ยังไม่มีสินค้าในตะกร้า" />
        )}
      </Drawer>
    );
  }
);

// Main Component
export default function MenuPage() {
  const params = useParams();
  const order_uuid = params?.uuid as string;
  const router = useRouter();

  // State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | undefined>();

  // Hooks
  const menu = useMenu({ isAdmin: false, limit: CONSTANTS.ITEMS_PER_PAGE });
  const cart = useCart();
  const orderSubmit = useOrderSubmit();
  const menuSelection = useMenuSelection(false);

  // Handlers
  const handleItemClick = useCallback(
    async (item: MenuItem) => {
      try {
        const itemSelected = await menuSelection.selectMenuItem(item);
        if (!itemSelected) return;

        setSelectedItem(itemSelected);

        if (MenuUtils.hasOptions(itemSelected)) {
          setIsModalVisible(true);
        } else {
          cart.addItem(item, [], 1);
          message.success(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`);
        }
      } catch (error) {
        message.error("เกิดข้อผิดพลาด");
      }
    },
    [cart, menuSelection]
  );

  const handleOptionSubmit = useCallback(
    (values: any) => {
      if (!selectedItem) return;

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

      cart.addItem(
        selectedItem,
        selectedOptions,
        values.quantity || 1,
        values.specialNote
      );

      message.success(`เพิ่ม ${selectedItem.name} ลงตะกร้าแล้ว`);
      setIsModalVisible(false);
      setSelectedItem(null);
    },
    [selectedItem, cart]
  );

  const handleCheckout = useCallback(async () => {
    if (cart.summary.isEmpty) {
      message.warning("กรุณาเลือกรายการอาหารก่อน");
      return;
    }

    try {
      const result = await orderSubmit.submitOrder(order_uuid, cart.items);

      if (result.success) {
        cart.clearCart();
        setIsCartVisible(false);
        message.success("สั่งอาหารสำเร็จ!");

        if (result.orderId) {
          router.push(`/customer/${order_uuid}/orders`);
        }
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  }, [cart, orderSubmit, order_uuid, router]);

  const handleCategoryChange = useCallback(
    (categoryId?: number) => {
      setActiveCategory(categoryId);
      if (!categoryId) return;
      menu.filterByCategory(categoryId);
    },
    [menu]
  );

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Layout className="min-h-screen">
      {/* Mobile Header */}
      <MobileHeader
        onCartClick={() => setIsCartVisible(true)}
        cartCount={cart.summary.totalQuantity}
        onBackClick={handleBackClick}
      />

      <Content className="bg-gray-100">
        {/* Category Tabs */}
        <CategoryTabs
          categories={menu.categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Menu List */}
        <div className="p-4">
          <Spin spinning={menu.isLoading}>
            {menu.menuItems?.items && menu.menuItems.items.length > 0 ? (
              <div className="space-y-3">
                {menu.menuItems.items.map((item: MenuItem) => (
                  <MobileMenuCard
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                  />
                ))}
              </div>
            ) : (
              <Empty description="ไม่พบเมนู" className="mt-20" />
            )}
          </Spin>
        </div>

        {/* Options Modal */}
        <MobileOptionsModal
          selectedItem={selectedItem}
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedItem(null);
          }}
          onSubmit={handleOptionSubmit}
        />

        {/* Cart Drawer */}
        <MobileCartDrawer
          visible={isCartVisible}
          onClose={() => setIsCartVisible(false)}
          cart={cart}
          onCheckout={handleCheckout}
          isSubmitting={orderSubmit.isSubmitting}
        />

        {/* Bottom Price Bar */}
        {cart.summary.totalQuantity > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-20 cursor-pointer"
            onClick={() => setIsCartVisible(true)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge count={cart.summary.totalQuantity} />
                <span className="font-medium">ตะกร้าสินค้า</span>
              </div>
              <span className="text-lg font-bold text-orange-600">
                {cart.summary.formattedPrice}
              </span>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
}