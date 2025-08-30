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
import { useMenuOptions } from "@/hooks/useMenuOptions";
import { useCart } from "@/hooks/useCart";
import { MenuUtils } from "@/utils/utils";
import { MenuItem } from "@/types";

const { Title, Paragraph } = Typography;

export default function MenuPage() {
  // ใช้ custom hooks
  const {
    menuItems,
    categories,
    isLoading,
    searchQuery,
    selectedCategory,
    search,
    filterByCategory,
    clearFilters,
    loadMenuItem,
    loadingItem: loadingItemDetail,
  } = useMenu({ isAdmin: false, limit: 12 });

  const {
    selectedOptions,
    handleOptionChange,
    resetOptions,
    validateRequiredOptions,
    getSelectedOptionsText,
  } = useMenuOptions();

  const { cartItems, addItem, updateItemQuantity, removeItem, getCartSummary } =
    useCart();

  // Local state สำหรับ UI
  const [cartVisible, setCartVisible] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { itemCount, totalPrice, formattedPrice, isEmpty } = getCartSummary();

  // Initialize category from URL params
  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam && !isNaN(Number(categoryParam))) {
      filterByCategory(Number(categoryParam));
    }
  }, [searchParams, filterByCategory]);

  // จัดการการคลิกเมนู
  const handleItemClick = async (item: MenuItem) => {
    const detailItem = await loadMenuItem(item.id);
    if (!detailItem) return;

    setSelectedItem(detailItem);
    setItemQuantity(1);
    resetOptions(detailItem);

    if (MenuUtils.hasOptions(detailItem)) {
      setOptionModalVisible(true);
    } else {
      addItem(detailItem, [], 1);
    }
  };

  // จัดการการเพิ่มเข้าตะกร้าพร้อมตัวเลือก
  const handleAddToCartWithOptions = () => {
    if (!selectedItem) return;

    const validation = MenuUtils.validateOptions(selectedItem, selectedOptions);
    if (!validation.isValid) {
      validation.errors.forEach((error) => message.error(error));
      return;
    }

    addItem(selectedItem, selectedOptions, itemQuantity);
    setOptionModalVisible(false);
  };

  // คำนวณราคารวมในตัวเลือก modal
  const calculateModalPrice = (): number => {
    if (!selectedItem) return 0;
    return MenuUtils.calculateTotalPrice(
      selectedItem,
      selectedOptions,
      itemQuantity
    );
  };

  // จัดการ checkout
  const handleCheckout = async () => {
    if (isEmpty) {
      message.warning("กรุณาเลือกรายการอาหารก่อน");
      return;
    }

    try {
      // TODO: ส่งข้อมูลไป API
      message.success("สั่งอาหารสำเร็จ!");
      setCartVisible(false);
      router.push("/customer/orders");
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Component สำหรับแสดง Search และ Filter
  const SearchAndFilter = () => (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12}>
          <Input.Search
            placeholder="ค้นหาเมนูอาหาร..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => search(e.target.value)}
            onSearch={search}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            placeholder="เลือกหมวดหมู่"
            allowClear
            size="large"
            className="w-full"
            value={selectedCategory}
            onChange={filterByCategory}
            options={categories?.map((cat: any) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Col>
        <Col xs={24} md={4}>
          <Button size="large" onClick={clearFilters}>
            ล้างตัวกรอง
          </Button>
        </Col>
      </Row>
    </div>
  );

  // Component สำหรับแสดงตัวเลือกในตะกร้า
  const CartItemOptions = ({ item }: { item: any }) => {
    if (!item.selectedOptions || item.selectedOptions.length === 0) return null;

    const optionsText = getSelectedOptionsText(item);
    const optionsPrice = MenuUtils.calculateOptionsPrice(item.selectedOptions);

    return (
      <div className="text-xs text-gray-500 mt-1">
        {optionsText && <div>{optionsText}</div>}
        {optionsPrice > 0 && (
          <div className="text-green-600">
            +฿{optionsPrice.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  // Modal สำหรับเลือกตัวเลือก
  const OptionsModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        title={`เลือกตัวเลือกสำหรับ ${selectedItem.name}`}
        open={optionModalVisible}
        onCancel={() => setOptionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setOptionModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button key="add" type="primary" onClick={handleAddToCartWithOptions}>
            เพิ่มลงตะกร้า - ฿{calculateModalPrice().toLocaleString()}
          </Button>,
        ]}
        width={600}
      >
        <div className="mb-4">
          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center rounded mb-4">
            <CoffeeOutlined className="text-4xl text-orange-500" />
          </div>
          <Title level={4}>{selectedItem.name}</Title>
          <Paragraph>{selectedItem.description}</Paragraph>
          <div className="text-xl font-bold text-orange-600 mb-4">
            ฿{selectedItem.price.toLocaleString()}
          </div>
        </div>

        <div className="mb-4">
          <span className="font-medium">จำนวน: </span>
          <InputNumber
            min={1}
            value={itemQuantity}
            onChange={(value) => setItemQuantity(value || 1)}
            className="ml-2"
          />
        </div>

        <Divider />

        {selectedItem.menu_option && selectedItem.menu_option.length > 0 ? (
          selectedItem.menu_option.map((menuOption, index) => (
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
                    menuOption.option?.type === "single" ? "blue" : "green"
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
                    selectedOptions.find(
                      (opt) => opt.optionId === menuOption.option?.id
                    )?.valueId
                  }
                  onChange={(e) => {
                    const value = menuOption.option?.optionValues.find(
                      (v) => v.id === e.target.value
                    );
                    if (value && menuOption.option) {
                      handleOptionChange(
                        menuOption.option.id,
                        value.id,
                        value.additionalPrice,
                        menuOption.option.isRequired,
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
                  value={selectedOptions
                    .filter((opt) => opt.optionId === menuOption.option?.id)
                    .map((opt) => opt.valueId)}
                  onChange={(checkedValues) => {
                    // ลบตัวเลือกเดิมของ option นี้
                    const otherOptions = selectedOptions.filter(
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

                    // setSelectedOptions([...otherOptions, ...newOptions]);
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
      </Modal>
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
        {loadingItemDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
              <LoadingOutlined className="text-2xl text-orange-500" />
              <span className="text-lg">กำลังโหลดรายละเอียดเมนู...</span>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <Spin spinning={isLoading}>
          {menuItems?.items && menuItems.items.length > 0 ? (
            <Row gutter={[16, 16]}>
              {menuItems.items.map((item: MenuItem) => (
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
                        loading={loadingItemDetail}
                        disabled={loadingItemDetail}
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
        <OptionsModal />

        {/* Floating Cart Button */}
        <Affix offsetBottom={20}>
          <div className="flex justify-end">
            <Badge count={itemCount} showZero={false}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => setCartVisible(true)}
                className="shadow-lg"
              >
                ตะกร้า {formattedPrice}
              </Button>
            </Badge>
          </div>
        </Affix>

        {/* Cart Drawer */}
        <Drawer
          title="ตะกร้าสินค้า"
          placement="right"
          size="large"
          onClose={() => setCartVisible(false)}
          open={cartVisible}
          footer={
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">รวม: {formattedPrice}</div>
              <Button
                type="primary"
                size="large"
                onClick={handleCheckout}
                disabled={isEmpty}
              >
                สั่งอาหาร ({itemCount} รายการ)
              </Button>
            </div>
          }
        >
          {!isEmpty ? (
            <Space direction="vertical" className="w-full">
              {cartItems.map((item, index) => (
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
                            updateItemQuantity(index, item.quantity - 1)
                          }
                        />
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) =>
                            updateItemQuantity(index, value || 1)
                          }
                          className="w-16"
                        />
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() =>
                            updateItemQuantity(index, item.quantity + 1)
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
