'use client';

import { useState, useEffect } from 'react';
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
  message
} from 'antd';
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  PlusOutlined,
  MinusOutlined,
  CoffeeOutlined 
} from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { customerService } from '@/services/customerService';

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get categories
  const { data: categories } = useSWR('categories', () =>
    customerService.getCategories()
  );

  // Get menu items
  const { data: menuItems, isLoading } = useSWR(
    searchQuery 
      ? `menu-search-${searchQuery}-${currentPage}` 
      : `menu-items-${selectedCategory}-${currentPage}`,
    () => {
      if (searchQuery) {
        return customerService.searchMenuItems(searchQuery, pageSize, currentPage);
      }
      return customerService.getMenuItems(pageSize, currentPage);
    }
  );

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && !isNaN(Number(categoryParam))) {
      setSelectedCategory(Number(categoryParam));
    }
  }, [searchParams]);

  const addToCart = (item: any) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1 
      }]);
    }
    message.success(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`);
  };

  const updateCartItemQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      message.warning('กรุณาเลือกรายการอาหารก่อน');
      return;
    }

    try {
      // Here you would normally create an order
      // For now, we'll just show a success message
      message.success('สั่งอาหารสำเร็จ!');
      setCartItems([]);
      setCartVisible(false);
      router.push('/customer/orders');
    } catch (error) {
      message.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
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
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
              >
                ล้างตัวกรอง
              </Button>
            </Col>
          </Row>
        </div>

        {/* Menu Items */}
        <Spin spinning={isLoading}>
          {menuItems?.data?.items?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {menuItems?.data.items.map((item: any) => (
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
                        onClick={() => addToCart(item)}
                      >
                        เพิ่มลงตะกร้า
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space direction="vertical" className="w-full">
                          <div className="font-semibold text-lg">{item.name}</div>
                          {item.category && (
                            <Tag color="orange">{item.category.name}</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" className="w-full">
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            className="text-gray-600 mb-2"
                          >
                            {item.description || 'อาหารอร่อย รสชาติเยี่ยม'}
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
              {cartItems.map((item) => (
                <Card key={item.id} size="small">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500">฿{item.price.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      />
                      <InputNumber
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={(value) => updateCartItemQuantity(item.id, value || 1)}
                        className="w-16"
                      />
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      />
                      <div className="text-orange-600 font-medium min-w-20 text-right">
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