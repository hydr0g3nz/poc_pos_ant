// src/app/customer/menu/page.tsx
"use client";

import { useState, useEffect } from "react";
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
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  CoffeeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { useSearchParams, useRouter } from "next/navigation";
import { useMenu } from "@/hooks/useMenu";
import { useMenuSelection } from "@/hooks/useMenuSelection";
import { useCart } from "@/hooks/useCart";
import { useOrderSubmit } from "@/hooks/useOrderSubmit";
import { useMenuModal } from "@/hooks/useMenuItemModal";
import { useCartDrawer } from "@/hooks/useCartDrawer";
import { MenuUtils } from "@/utils/utils";
import { MenuItem, CartItem, SelectedOption } from "@/types";

const { Title, Paragraph } = Typography;

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Hooks
  const menu = useMenu({ isAdmin: false, limit: 12 });
  const selection = useMenuSelection(false);
  const cart = useCart();
  const orderSubmit = useOrderSubmit();
  const modal = useMenuModal();
  const drawer = useCartDrawer();

  // Initialize category from URL params
  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam && !isNaN(Number(categoryParam))) {
      menu.filterByCategory(Number(categoryParam));
    }
  }, [searchParams]);

  // จัดการการคลิกเมนู
  const handleItemClick = async (item: MenuItem) => {
    const itemSelected = await selection.selectMenuItem(item);
    if (!itemSelected) return;

    if (MenuUtils.hasOptions(itemSelected)) {
      modal.openModal(itemSelected);
    } else {
      // เพิ่มเข้าตะกร้าเลยถ้าไม่มี options
      cart.addItem(item, [], 1);
    }
  };

  // จัดการการเพิ่มเข้าตะกร้าพร้อมตัวเลือก
  const handleAddToCartWithOptions = () => {
    if (!selection.selectedItem) return;

    const validation = selection.validation;
    if (!validation.isValid) {
      validation.errors.forEach((error) => message.error(error));
      return;
    }

    cart.addItem(
      selection.selectedItem,
      selection.selectedOptions,
      selection.quantity
    );

    modal.closeModal();
    selection.clearSelection();
  };

  // จัดการการ checkout
  const handleCheckout = async () => {
    if (cart.summary.isEmpty) {
      message.warning("กรุณาเลือกรายการอาหารก่อน");
      return;
    }

    try {
      // ในอนาคตจะได้ orderId จากการสแกน QR หรือ create order
      const mockOrderId = 6; // ต้องแทนที่ด้วย logic จริง

      const result = await orderSubmit.submitOrder(mockOrderId, cart.items);

      if (result.success) {
        cart.clearCart();
        drawer.closeDrawer();

        // ไปหน้าติดตามออเดอร์ (ถ้ามี)
        message.success("สั่งอาหารสำเร็จ!");
        // router.push(`/customer/orders/${result.orderId}`);
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Component สำหรับ Search และ Filter
  const SearchAndFilter = () => (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12}>
          <Input.Search
            placeholder="ค้นหาเมนูอาหาร..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={menu.searchQuery}
            onChange={(e) => menu.search(e.target.value)}
            onSearch={menu.search}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            placeholder="เลือกหมวดหมู่"
            allowClear
            size="large"
            className="w-full"
            value={menu.selectedCategory}
            onChange={menu.filterByCategory}
            options={menu.categories?.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Col>
        <Col xs={24} md={4}>
          <Button size="large" onClick={menu.clearFilters}>
            ล้างตัวกรอง
          </Button>
        </Col>
      </Row>
    </div>
  );

  const CartItemOptions = ({ item }: { item: CartItem }) => {
    if (!item.selectedOptions?.length && !item.optionsText) return null;

    const optionsPrice = MenuUtils.calculateOptionsPrice(
      item.selectedOptions || []
    );

    return (
      <div className="text-xs text-gray-500 mt-1">
        {item.optionsText && <div className="mb-1">{item.optionsText}</div>}
        {optionsPrice > 0 && (
          <div className="text-green-600">
            +฿{optionsPrice.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Title level={1}>เมนูอาหาร</Title>
          <Paragraph>เลือกอาหารและเครื่องดื่มที่คุณชื่นชอบ</Paragraph>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter />

        {/* Loading overlay */}
        {selection.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
              <LoadingOutlined className="text-2xl text-orange-500" />
              <span className="text-lg">กำลังโหลดรายละเอียดเมนู...</span>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <Spin spinning={menu.isLoading}>
          {menu.menuItems?.items && menu.menuItems.items.length > 0 ? (
            <Row gutter={[16, 16]}>
              {menu.menuItems.items.map((item: MenuItem) => (
                <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className="h-full"
                    cover={
                      <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <CoffeeOutlined className="text-4xl text-orange-500" />
                      </div>
                    }
                    actions={[
                      <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleItemClick(item)}
                        loading={selection.isLoading}
                        disabled={selection.isLoading}
                      >
                        เลือกเมนู
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space direction="vertical" className="w-full">
                          <div className="font-semibold text-lg">
                            {item.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.category && (
                              <Tag color="orange">{item.category}</Tag>
                            )}
                            {MenuUtils.hasOptions(item) && (
                              <Tag color="blue">
                                มีตัวเลือก ({item.menu_option?.length})
                              </Tag>
                            )}
                            {item.is_recommended && (
                              <Tag color="gold">แนะนำ</Tag>
                            )}
                          </div>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" className="w-full">
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            className="text-gray-600 mb-2"
                          >
                            {item.description || "อาหารอร่อย รสชาติเยี่ยม"}
                          </Paragraph>
                          <div className="text-xl font-bold text-orange-600">
                            ฿{item.price?.toLocaleString()}
                          </div>
                        </Space>
                      }
                    />
                  </Card>
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

        {/* Options Modal */}
        <Modal
          title={`เลือกตัวเลือกสำหรับ ${selection.selectedItem?.name || ""}`}
          open={modal.isVisible}
          onCancel={() => {
            modal.closeModal();
            selection.clearSelection();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                modal.closeModal();
                selection.clearSelection();
              }}
            >
              ยกเลิก
            </Button>,
            <Button
              key="add"
              type="primary"
              onClick={handleAddToCartWithOptions}
              disabled={!selection.validation.isValid}
            >
              เพิ่มลงตะกร้า - ฿{selection.totalPrice.toLocaleString()}
            </Button>,
          ]}
          width={600}
        >
          {selection.selectedItem && (
            <div>
              <div className="mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center rounded mb-4">
                  <CoffeeOutlined className="text-4xl text-orange-500" />
                </div>
                <Title level={4}>{selection.selectedItem.name}</Title>
                <Paragraph>{selection.selectedItem.description}</Paragraph>
                <div className="text-xl font-bold text-orange-600 mb-4">
                  ฿{selection.selectedItem.price.toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <span className="font-medium">จำนวน: </span>
                <InputNumber
                  min={1}
                  value={selection.quantity}
                  onChange={(value) => selection.setItemQuantity(value || 1)}
                  className="ml-2"
                />
              </div>

              <Divider />

              {selection.selectedItem.menu_option?.length > 0 ? (
                selection.selectedItem.menu_option.map((menuOption, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex items-center mb-3">
                      <Title level={5} className="mb-0 mr-2">
                        {menuOption.option?.name}
                      </Title>
                      {menuOption.option?.isRequired && (
                        <Tag color="red">บังคับเลือก</Tag>
                      )}
                      <Tag
                        color={
                          menuOption.option?.type === "single"
                            ? "blue"
                            : "green"
                        }
                      >
                        {menuOption.option?.type === "single"
                          ? "เลือกได้ 1 ตัวเลือก"
                          : "เลือกได้หลายตัวเลือก"}
                      </Tag>
                    </div>

                    {menuOption.option?.type === "single" ? (
                      <Radio.Group
                        value={
                          selection.selectedOptions.find(
                            (opt) => opt.optionId === menuOption.option?.id
                          )?.valueId
                        }
                        onChange={(e) => {
                          const value = menuOption.option?.optionValues.find(
                            (v) => v.id === e.target.value
                          );
                          if (value && menuOption.option) {
                            selection.handleOptionChange(
                              menuOption.option.id,
                              value.id,
                              parseFloat(value.additionalPrice),
                              menuOption.option.type
                            );
                          }
                        }}
                      >
                        <Space direction="vertical">
                          {menuOption.option?.optionValues.map((value) => (
                            <Radio key={value.id} value={value.id}>
                              <div className="flex justify-between items-center w-96">
                                <span>{value.name}</span>
                                <span className="ml-4">
                                  {parseFloat(value.additionalPrice) > 0 ? (
                                    <span className="text-green-600">
                                      +฿
                                      {parseFloat(
                                        value.additionalPrice
                                      ).toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">ฟรี</span>
                                  )}
                                </span>
                              </div>
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    ) : (
                      <Checkbox.Group
                        value={selection.selectedOptions
                          .filter(
                            (opt) => opt.optionId === menuOption.option?.id
                          )
                          .map((opt) => opt.valueId)}
                        onChange={(checkedValues) => {
                          // ลบตัวเลือกเดิมของ option นี้
                          const otherOptions = selection.selectedOptions.filter(
                            (opt) => opt.optionId !== menuOption.option?.id
                          );

                          // เพิ่มตัวเลือกใหม่
                          const newOptions = checkedValues.map((valueId) => {
                            const value = menuOption.option?.optionValues.find(
                              (v) => v.id === valueId
                            );
                            return {
                              optionId: menuOption.option?.id || 0,
                              valueId: valueId as number,
                              additionalPrice: parseFloat(
                                value?.additionalPrice || "0"
                              ),
                            };
                          });

                          // อัพเดท selection
                          selection.selectedOptions.splice(0);
                          selection.selectedOptions.push(
                            ...otherOptions,
                            ...newOptions
                          );
                        }}
                      >
                        <Space direction="vertical">
                          {menuOption.option?.optionValues.map((value) => (
                            <Checkbox key={value.id} value={value.id}>
                              <div className="flex justify-between items-center w-96">
                                <span>{value.name}</span>
                                <span className="ml-4">
                                  {parseFloat(value.additionalPrice) > 0 ? (
                                    <span className="text-green-600">
                                      +฿
                                      {parseFloat(
                                        value.additionalPrice
                                      ).toLocaleString()}
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
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  เมนูนี้ไม่มีตัวเลือกเพิ่มเติม
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Floating Cart Button */}
        <Affix offsetBottom={20}>
          <div className="flex justify-end">
            <Badge count={cart.summary.totalQuantity} showZero={false}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={drawer.openDrawer}
                className="shadow-lg"
              >
                ตะกร้า {cart.summary.formattedPrice}
              </Button>
            </Badge>
          </div>
        </Affix>

        {/* Cart Drawer */}
        <Drawer
          title="ตะกร้าสินค้า"
          placement="right"
          size="large"
          onClose={drawer.closeDrawer}
          open={drawer.isVisible}
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
              >
                สั่งอาหาร ({cart.summary.totalQuantity} รายการ)
              </Button>
            </div>
          }
        >
          {!cart.summary.isEmpty ? (
            <Space direction="vertical" className="w-full">
              {cart.items.map((item, index) => (
                <Card key={index}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500">
                        ฿{(item.price / item.quantity).toLocaleString()} x{" "}
                        {item.quantity}
                      </div>
                      <CartItemOptions item={item} />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          icon={<MinusOutlined />}
                          onClick={() =>
                            cart.updateQuantity(index, item.quantity - 1)
                          }
                        />
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) =>
                            cart.updateQuantity(index, value || 1)
                          }
                          className="w-16"
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() =>
                            cart.updateQuantity(index, item.quantity + 1)
                          }
                        />
                      </div>
                      <div className="text-orange-600 font-medium">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Empty description="ไม่มีสินค้าในตะกร้า" />
          )}
        </Drawer>
      </div>
    </div>
  );
}
