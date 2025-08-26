'use client';

import { Button, Card, Col, Row, Typography, Space } from 'antd';
import { ShoppingCartOutlined, SettingOutlined, CoffeeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center py-12">
          <CoffeeOutlined className="text-6xl text-orange-500 mb-4" />
          <Title level={1} className="text-orange-800 mb-4">
            ระบบสั่งอาหารออนไลน์
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            สั่งอาหารง่ายๆ ผ่านมือถือ หรือจัดการร้านของคุณได้อย่างมีประสิทธิภาพ
          </Paragraph>
        </div>

        {/* Cards */}
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              className="h-full shadow-lg border-0"
              cover={
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48 flex items-center justify-center">
                  <ShoppingCartOutlined className="text-6xl text-white" />
                </div>
              }
              onClick={() => router.push('/customer')}
            >
              <Card.Meta
                title={<span className="text-xl">สำหรับลูกค้า</span>}
                description="ดูเมนู สั่งอาหาร และติดตามออเดอร์ของคุณ"
              />
              <div className="mt-4">
                <Button type="primary" size="large" block>
                  เริ่มสั่งอาหาร
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              className="h-full shadow-lg border-0"
              cover={
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-48 flex items-center justify-center">
                  <SettingOutlined className="text-6xl text-white" />
                </div>
              }
              onClick={() => router.push('/admin')}
            >
              <Card.Meta
                title={<span className="text-xl">สำหรับแอดมิน</span>}
                description="จัดการเมนู ออเดอร์ โต๊ะ และรายงานยอดขาย"
              />
              <div className="mt-4">
                <Button type="primary" size="large" block>
                  เข้าสู่ระบบจัดการ
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Features */}
        <div className="mt-16 text-center">
          <Title level={2} className="text-gray-800 mb-8">
            ฟีเจอร์หลัก
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CoffeeOutlined className="text-2xl text-orange-600" />
                </div>
                <Title level={4}>เมนูหลากหลาย</Title>
                <Paragraph>เมนูอาหารและเครื่องดื่มมากมาย</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartOutlined className="text-2xl text-green-600" />
                </div>
                <Title level={4}>สั่งง่าย</Title>
                <Paragraph>สั่งอาหารง่ายๆ ผ่านมือถือ</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SettingOutlined className="text-2xl text-blue-600" />
                </div>
                <Title level={4}>จัดการง่าย</Title>
                <Paragraph>ระบบจัดการที่ใช้งานง่าย</Paragraph>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CoffeeOutlined className="text-2xl text-purple-600" />
                </div>
                <Title level={4}>รวดเร็ว</Title>
                <Paragraph>การสั่งและเสิร์ฟที่รวดเร็ว</Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}