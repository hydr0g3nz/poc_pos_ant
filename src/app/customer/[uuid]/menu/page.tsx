// src/app/customer/[uuid]/menu/page.tsx
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
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  CloseOutlined,
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

// Constants
const CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,
} as const;

// Simplified Mobile Menu Card
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
        className="bg-white rounded-lg shadow-sm overflow-hidden"
        onClick={handleClick}
      >
        {/* Image Container */}
        <div className="aspect-square bg-gradient-to-br from-yellow-600 to-orange-700 p-4">
          <div className="bg-white/90 rounded-lg h-full flex items-center justify-center">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center p-4">
                <div className="text-6xl mb-2">🥤</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
            {item.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              ฿{item.price?.toFixed(2)}
            </span>
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
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 p-3 min-w-max">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory
                  ? "bg-blue-500 text-white"
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
                    ? "bg-blue-500 text-white"
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

// Simplified Options Modal for Mobile
// Simplified Options Modal for Mobile
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

    // ย้าย hooks ทั้งหมดขึ้นมาก่อน conditional return
    const watchedValues = Form.useWatch([], form);

    const calculatedPrice = useMemo(() => {
      if (!selectedItem) return 0;
      let price = selectedItem.price;

      // Add options price calculation if needed
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

    // Reset form when item changes
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

    // ย้าย conditional return มาหลัง hooks ทั้งหมด
    if (!selectedItem) return null;

    return (
      <Drawer
        title={null}
        placement="bottom"
        onClose={onClose}
        open={visible}
        height="auto"
        closable={false}
        className="rounded-t-3xl"
      >
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            shape="circle"
          />
        </div>

        {/* Item Info */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">🥤</div>
          <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {selectedItem.description}
          </p>
        </div>

        <Form form={form} layout="vertical">
          {/* Options */}
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
            >
              {menuOption.option?.type === "single" ? (
                <Radio.Group className="w-full">
                  <Space direction="vertical" className="w-full">
                    {menuOption.option?.optionValues.map((value: any) => (
                      <Radio key={value.id} value={value.id}>
                        <div className="flex justify-between w-full">
                          <span>{value.name}</span>
                          {parseFloat(value.additionalPrice) > 0 && (
                            <span className="text-green-600 ml-4">
                              +฿{parseFloat(value.additionalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              ) : (
                <Checkbox.Group className="w-full">
                  <Space direction="vertical" className="w-full">
                    {menuOption.option?.optionValues.map((value: any) => (
                      <Checkbox key={value.id} value={value.id}>
                        <div className="flex justify-between w-full">
                          <span>{value.name}</span>
                          {parseFloat(value.additionalPrice) > 0 && (
                            <span className="text-green-600 ml-4">
                              +฿{parseFloat(value.additionalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
            </Form.Item>
          ))}

          {/* Special Note */}
          <Form.Item name="specialNote" label="หมายเหตุพิเศษ">
            <Input.TextArea
              rows={2}
              placeholder="เช่น ไม่เผ็ด, ไม่ใส่น้ำแข็ง"
            />
          </Form.Item>
        </Form>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-3">
            <Button
              shape="circle"
              icon={<MinusOutlined />}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            />
            <span className="font-semibold text-lg w-8 text-center">
              {quantity}
            </span>
            <Button
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => setQuantity(quantity + 1)}
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
      </Drawer>
    );
  }
);

// Simplified Cart Drawer
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

      // Process options
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Category Tabs */}
      <CategoryTabs
        categories={menu.categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Menu Grid */}
      <div className="p-3">
        <Spin spinning={menu.isLoading}>
          {menu.menuItems?.items && menu.menuItems.items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
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

      {/* Floating Cart Button */}
      <FloatButton
        badge={{ count: cart.summary.totalQuantity }}
        icon={<ShoppingCartOutlined />}
        type="primary"
        onClick={() => setIsCartVisible(true)}
        style={{ bottom: 24, right: 24 }}
      />

      {/* Bottom Price Bar (Alternative) */}
      {cart.summary.totalQuantity > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-20"
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
    </div>
  );
}
