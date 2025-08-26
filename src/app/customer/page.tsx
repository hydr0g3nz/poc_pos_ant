'use client';

import { Card, Row, Col, Typography, Button, Carousel, Space, Divider } from 'antd';
import { 
  CoffeeOutlined, 
  FireOutlined, 
  HeartOutlined, 
  ClockCircleOutlined,
  RightOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { customerService } from '@/services/customerService';

const { Title, Paragraph } = Typography;

export default function CustomerDashboard() {
  const router = useRouter();

  const { data: categories } = useSWR('categories', () =>
    customerService.getCategories()
  );

  const { data: featuredItems } = useSWR('featured-menu', () =>
    customerService.getMenuItems(6, 1)
  );

  const carouselImages = [
    {
      title: 'อาหารไทยแท้',
      subtitle: 'รสชาติต้นตำรับ',
      image: '/images/thai-food-1.jpg',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'เครื่องดื่มสด',
      subtitle: 'สดชื่นทุกแก้ว',
      image: '/images/drinks-1.jpg',
      color: 'from-blue-500 to-teal-500'
    },
    {
      title: 'ของหวานอร่อย',
      subtitle: 'หวานฉ่ำ ถูกใจ',
      image: '/images/dessert-1.jpg',
      color: 'from-pink-500 to-purple-500'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <Carousel autoplay className="mb-8">
        {carouselImages.map((item, index) => (
          <div key={index}>
            <div className={`h-64 bg-gradient-to-r ${item.color} flex items-center justify-center text-white`}>
              <div className="text-center">
                <Title level={1} className="text-white mb-2">
                  {item.title}
                </Title>
                <Paragraph className="text-xl text-white/90 mb-4">
                  {item.subtitle}
                </Paragraph>
                <Button 
                  size="large" 
                  className="bg-white text-gray-800 border-0 hover:bg-gray-100"
                  onClick={() => router.push('/customer/menu')}
                >
                  ดูเมนู
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Quick Actions */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={12} sm={6}>
            <Card 
              hoverable
              className="text-center h-full"
              onClick={() => router.push('/customer/menu')}
            >
              <CoffeeOutlined className="text-3xl text-orange-500 mb-2" />
              <div>ดูเมนูทั้งหมด</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card 
              hoverable
              className="text-center h-full"
              onClick={() => router.push('/customer/menu?category=popular')}
            >
              <FireOutlined className="text-3xl text-red-500 mb-2" />
              <div>เมนูยอดนิยม</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card 
              hoverable
              className="text-center h-full"
              onClick={() => router.push('/customer/orders')}
            >
              <ClockCircleOutlined className="text-3xl text-blue-500 mb-2" />
              <div>ออเดอร์ของฉัน</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card 
              hoverable
              className="text-center h-full"
              onClick={() => router.push('/customer/favorites')}
            >
              <HeartOutlined className="text-3xl text-pink-500 mb-2" />
              <div>รายการโปรด</div>
            </Card>
          </Col>
        </Row>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Title level={2}>หมวดหมู่อาหาร</Title>
            <Button 
              type="link" 
              icon={<RightOutlined />}
              onClick={() => router.push('/customer/menu')}
            >
              ดูทั้งหมด
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {categories?.data?.map((category: any) => (
              <Col key={category.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable
                  className="text-center"
                  onClick={() => router.push(`/customer/menu?category=${category.id}`)}
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CoffeeOutlined className="text-2xl text-orange-600" />
                  </div>
                  <div className="font-medium">{category.name}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Featured Items */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Title level={2}>เมนูแนะนำ</Title>
            <Button 
              type="link" 
              icon={<RightOutlined />}
              onClick={() => router.push('/customer/menu')}
            >
              ดูทั้งหมด
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {featuredItems?.data?.items?.slice(0, 6).map((item: any) => (
              <Col key={item.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  cover={
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <CoffeeOutlined className="text-4xl text-orange-500" />
                    </div>
                  }
                  actions={[
                    <Button 
                      key="order" 
                      type="primary" 
                      onClick={() => router.push(`/customer/menu/${item.id}`)}
                    >
                      สั่งเลย
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={item.name}
                    description={
                      <Space direction="vertical" className="w-full">
                        <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600">
                          {item.description || 'อาหารอร่อย รสชาติเยี่ยม'}
                        </Paragraph>
                        <div className="text-lg font-semibold text-orange-600">
                          ฿{item.price}
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}