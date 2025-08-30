// src/app/customer/menu/page.tsx - แก้ไข handleItemClick

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Select,
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
  List,
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
import useSWR from "swr";
import { customerService } from "@/services/customerService";
import { MenuItem, SelectedOption, CartItem, MenuItemOption } from "@/types";

const { Title, Paragraph } = Typography;
const { Search } = Input;

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [loadingItemDetail, setLoadingItemDetail] = useState(false);
  const pageSize = 12;

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get categories
  const { data: categories } = useSWR("categories", () =>
    customerService.getCategories()
  );

  // Get menu items
  const { data: menuItems, isLoading } = useSWR(
    searchQuery
      ? `menu-search-${searchQuery}-${currentPage}`
      : `menu-items-${selectedCategory}-${currentPage}`,
    () => {
      if (searchQuery) {
        return customerService.searchMenuItems(
          searchQuery,
          pageSize,
          currentPage
        );
      }
      return customerService.getMenuItems(pageSize, currentPage);
    }
  );

  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam && !isNaN(Number(categoryParam))) {
      setSelectedCategory(Number(categoryParam));
    }
  }, [searchParams]);

  // แก้ไข handleItemClick ให้เรียก API เสมอ
  const handleItemClick = async (item: MenuItem) => {
    setLoadingItemDetail(true);

    try {
      // เรียก API ดึงข้อมูลรายละเอียดเมนูเสมอ
      const response = await customerService.getMenuItem(item.id);
      const detailItem = response.data;

      setSelectedItem(detailItem);
      setSelectedOptions([]);
      setItemQuantity(1);

      // ตั้งค่าตัวเลือกเริ่มต้น (สำหรับ required options ที่มี default value)
      const defaultOptions: SelectedOption[] = [];
      if (detailItem.menu_option) {
        detailItem.menu_option.forEach((menuOption) => {
          if (menuOption.option?.isRequired) {
            const defaultValue = menuOption.option.optionValues.find(
              (val) => val.isDefault
            );
            if (defaultValue) {
              defaultOptions.push({
                optionId: menuOption.option.id,
                valueId: defaultValue.id,
                additionalPrice: parseFloat(defaultValue.additionalPrice),
              });
            }
          }
        });
      }
      setSelectedOptions(defaultOptions);

      // ถ้ามีตัวเลือก ให้แสดง modal เลือกตัวเลือก
      if (detailItem.menu_option && detailItem.menu_option.length > 0) {
        setOptionModalVisible(true);
      } else {
        // ถ้าไม่มีตัวเลือก เพิ่มเข้าตะกร้าเลย
        addToCart(detailItem, [], 1);
      }
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดเมนูได้");
    } finally {
      setLoadingItemDetail(false);
    }
  };

  const handleOptionChange = (
    optionId: number,
    valueId: number,
    additionalPrice: string,
    isRequired: boolean,
    type: string
  ) => {
    const price = parseFloat(additionalPrice);

    if (type === "single") {
      // ลบตัวเลือกเดิมของ option นี้ออกก่อน (สำหรับ single choice)
      const newOptions = selectedOptions.filter(
        (opt) => opt.optionId !== optionId
      );
      newOptions.push({
        optionId,
        valueId,
        additionalPrice: price,
      });
      setSelectedOptions(newOptions);
    } else {
      // สำหรับ multiple choice
      const existingIndex = selectedOptions.findIndex(
        (opt) => opt.optionId === optionId && opt.valueId === valueId
      );

      if (existingIndex >= 0) {
        // ลบถ้ามีอยู่แล้ว
        const newOptions = [...selectedOptions];
        newOptions.splice(existingIndex, 1);
        setSelectedOptions(newOptions);
      } else {
        // เพิ่มใหม่
        setSelectedOptions([
          ...selectedOptions,
          {
            optionId,
            valueId,
            additionalPrice: price,
          },
        ]);
      }
    }
  };

  const validateRequiredOptions = (): boolean => {
    if (!selectedItem) return false;

    for (const menuOption of selectedItem.menu_option || []) {
      if (menuOption.option?.isRequired) {
        const hasSelection = selectedOptions.some(
          (opt) => opt.optionId === menuOption.option?.id
        );
        if (!hasSelection) {
          message.error(`กรุณาเลือก ${menuOption.option.name}`);
          return false;
        }
      }
    }
    return true;
  };

  const calculateTotalPrice = (): number => {
    if (!selectedItem) return 0;

    const basePrice = selectedItem.price;
    const optionsPrice = selectedOptions.reduce(
      (sum, opt) => sum + opt.additionalPrice,
      0
    );
    return (basePrice + optionsPrice) * itemQuantity;
  };

  const addToCartWithOptions = () => {
    if (!selectedItem) return;

    if (!validateRequiredOptions()) return;

    addToCart(selectedItem, selectedOptions, itemQuantity);
    setOptionModalVisible(false);
  };

  const addToCart = (
    item: MenuItem,
    options: SelectedOption[],
    quantity: number
  ) => {
    const basePrice = item.price;
    const optionsPrice = options.reduce(
      (sum, opt) => sum + opt.additionalPrice,
      0
    );
    const finalPrice = basePrice + optionsPrice;

    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: finalPrice,
      quantity: quantity,
      selectedOptions: options,
    };

    // หา item ที่มี id และ options เหมือนกันในตะกร้า
    const existingItemIndex = cartItems.findIndex(
      (cartItem) =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.selectedOptions) === JSON.stringify(options)
    );

    if (existingItemIndex >= 0) {
      const newCartItems = [...cartItems];
      newCartItems[existingItemIndex].quantity += quantity;
      setCartItems(newCartItems);
    } else {
      setCartItems([...cartItems, cartItem]);
    }

    message.success(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`);
  };

  const updateCartItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    const newCartItems = [...cartItems];
    newCartItems[index].quantity = quantity;
    setCartItems(newCartItems);
  };

  const removeFromCart = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      message.warning("กรุณาเลือกรายการอาหารก่อน");
      return;
    }

    try {
      message.success("สั่งอาหารสำเร็จ!");
      setCartItems([]);
      setCartVisible(false);
      router.push("/customer/orders");
    } catch (error) {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const renderOptionsModal = () => {
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
          <Button key="add" type="primary" onClick={addToCartWithOptions}>
            เพิ่มลงตะกร้า - ฿{calculateTotalPrice().toLocaleString()}
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
                  <Tag color="red" size="small">
                    บังคับเลือก
                  </Tag>
                )}
                <Tag
                  color={menuOption.option?.type === "single" ? "blue" : "green"}
                  size="small"
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
                    if (menuOption.option===undefined) return;
                    if (value) {
                      handleOptionChange(
                        menuOption.option.id,
                        value.id,
                        value.additionalPrice,
                        menuOption.option?.isRequired,
                        menuOption.option?.type
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
                        optionId: menuOption.option?.id,
                        valueId: valueId as number,
                        additionalPrice: parseFloat(
                          value?.additionalPrice || "0"
                        ),
                      };
                    });

                    setSelectedOptions([...otherOptions, ...newOptions]);
                  }}
                >
                  <Space direction="vertical">
                    {menuOption.option.optionValues.map((value) => (
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

  const renderCartItemOptions = (item: CartItem) => {
    if (!item.selectedOptions || item.selectedOptions.length === 0) return null;

    // ควรจะแสดงชื่อตัวเลือกที่เลือกจริงๆ แต่เนื่องจากเราไม่ได้เก็บชื่อไว้
    // เลยแสดงเป็นจำนวนและราคาเพิ่มเติมแทน
    return (
      <div className="text-xs text-gray-500 mt-1">
        ตัวเลือก: {item.selectedOptions.length} รายการ
        {item.selectedOptions.some((opt) => opt.additionalPrice > 0) && (
          <span className="text-green-600">
            {" "}
            (+฿
            {item.selectedOptions
              .reduce((sum, opt) => sum + opt.additionalPrice, 0)
              .toLocaleString()}
            )
          </span>
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
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Search
                placeholder="ค้นหาเมนูอาหาร..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={setSearchQuery}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="เลือกหมวดหมู่"
                allowClear
                size="large"
                className="w-full"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories?.data?.map((cat: any) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />
            </Col>
            <Col xs={24} md={4}>
              <Button
                size="large"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
              >
                ล้างตัวกรอง
              </Button>
            </Col>
          </Row>
        </div>

        {/* Loading overlay สำหรับการโหลดรายละเอียดเมนู */}
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
          {menuItems?.data?.items?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {menuItems?.data.items.map((item: MenuItem) => (
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
                            {/* แสดง preview ว่ามีตัวเลือกหรือไม่ จาก list data */}
                            {item.menu_option &&
                              item.menu_option.length > 0 && (
                                <Tag color="blue">
                                  มีตัวเลือก ({item.menu_option.length})
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
        {renderOptionsModal()}

        {/* Floating Cart Button */}
        <Affix offsetBottom={20}>
          <div className="flex justify-end">
            <Badge count={getTotalItems()} showZero={false}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => setCartVisible(true)}
                className="shadow-lg"
              >
                ตะกร้า ฿{getTotalPrice().toLocaleString()}
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
              <div className="text-xl font-bold">
                รวม: ฿{getTotalPrice().toLocaleString()}
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                สั่งอาหาร ({getTotalItems()} รายการ)
              </Button>
            </div>
          }
        >
          {cartItems.length > 0 ? (
            <Space direction="vertical" className="w-full">
              {cartItems.map((item, index) => (
                <Card key={`${item.id}-${index}`} size="small">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500">
                        ฿{(item.price / item.quantity).toLocaleString()} x{" "}
                        {item.quantity}
                      </div>
                      {renderCartItemOptions(item)}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() =>
                            updateCartItemQuantity(index, item.quantity - 1)
                          }
                        />
                        <InputNumber
                          size="small"
                          min={1}
                          value={item.quantity}
                          onChange={(value) =>
                            updateCartItemQuantity(index, value || 1)
                          }
                          className="w-16"
                        />
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            updateCartItemQuantity(index, item.quantity + 1)
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
