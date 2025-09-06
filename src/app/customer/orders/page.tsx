// src/app/customer/orders/page.tsx
'use client';

import { Card, Empty, Tabs, Tag, Typography, Space, Button, List, Spin, Badge, Divider, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  LoadingOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  CheckOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import { customerService } from '@/services/customerService';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title, Paragraph, Text } = Typography;

export default function OrdersPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: openOrders, isLoading: loadingOpen } = useSWR(
    [`orders-open-${refreshKey}`], 
    () => customerService.getOrdersByStatus('open', 50, 1),
    { refreshInterval: 5000 } // refresh every 5 seconds
  );

  const { data: closedOrders, isLoading: loadingClosed } = useSWR(
    [`orders-closed-${refreshKey}`], 
    () => customerService.getOrdersByStatus('closed', 50, 1)
  );

  const getStatusConfig = (status: string) => {
    const configs = {
      'open': { color: 'processing', icon: <ClockCircleOutlined />, text: 'กำลังดำเนินการ' },
      'preparing': { color: 'warning', icon: <FireOutlined />, text: 'กำลังเตรียม' },
      'ready': { color: 'success', icon: <CheckCircleOutlined />, text: 'พร้อมเสิร์ฟ' },
      'served': { color: 'default', icon: <CheckOutlined />, text: 'เสิร์ฟแล้ว' },
      'closed': { color: 'default', icon: <CheckOutlined />, text: 'เสร็จสิ้น' },
      'cancelled': { color: 'error', icon: <CloseCircleOutlined />, text: 'ยกเลิก' }
    };
    return configs[status] || configs['open'];
  };

  const handleViewDetail = (orderId: number) => {
    router.push(`/customer/orders/${orderId}`);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const OrderCard = ({ order }: { order: any }) => {
    const statusConfig = getStatusConfig(order.status);
    
    return (
      <Card 
        className="mb-4 shadow-sm hover:shadow-md transition-shadow"
        title={
          <div className="flex justify-between items-center">
            <Space>
              <ShoppingCartOutlined className="text-orange-500" />
              <span className="font-semibold">ออเดอร์ #{order.id}</span>
            </Space>
            <Tag 
              color={statusConfig.color} 
              icon={statusConfig.icon}
              className="text-sm"
            >
              {statusConfig.text}
            </Tag>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(order.id)}
          >
            ดูรายละเอียด
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size="small" className="w-full">
              <div>
                <Text type="secondary" className="text-xs">โต๊ะ</Text>
                <div className="font-medium">{order.table?.table_number}</div>
              </div>
              <div>
                <Text type="secondary" className="text-xs">วันที่สั่ง</Text>
                <div className="text-sm">{moment(order.created_at).format('DD/MM/YYYY HH:mm')}</div>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small" className="w-full" align="end">
              <div className="text-right">
                <Text type="secondary" className="text-xs">จำนวนรายการ</Text>
                <div className="font-medium">{order.items?.length || 0} รายการ</div>
              </div>
              {order.total && (
                <div className="text-right">
                  <Text type="secondary" className="text-xs">ยอดรวม</Text>
                  <div className="text-lg font-bold text-orange-600">
                    ฿{order.total.toLocaleString()}
                  </div>
                </div>
              )}
            </Space>
          </Col>
        </Row>

        {order.items && order.items.length > 0 && (
          <>
            <Divider className="my-3" />
            <div>
              <Text type="secondary" className="text-xs">รายการอาหารโดยย่อ</Text>
              <div className="mt-1">
                {order.items.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span className="truncate mr-2">
                      {item.menu_item?.name || `รายการ #${item.item_id}`}
                    </span>
                    <span className="text-gray-500 whitespace-nowrap">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <Text type="secondary" className="text-xs">
                    และอีก {order.items.length - 3} รายการ...
                  </Text>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    );
  };

  const OrderList = ({ orders, loading }: { orders: any; loading: boolean }) => (
    <Spin spinning={loading}>
      <div className="space-y-4">
        {orders?.data && orders.data.length > 0 ? (
          orders.data.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-12">
            <Empty 
              description="ไม่มีออเดอร์" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </Spin>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Title level={1} className="mb-2">ออเดอร์ของฉัน</Title>
          <Paragraph className="text-gray-600">
            ตรวจสอบสถานะออเดอร์และประวัติการสั่งอาหาร
          </Paragraph>
          <Button onClick={handleRefresh} loading={loadingOpen || loadingClosed}>
            รีเฟรช
          </Button>
        </div>

        <Tabs
          defaultActiveKey="current"
          size="large"
          items={[
            {
              key: 'current',
              label: (
                <Space>
                  <Badge 
                    count={openOrders?.data?.length || 0} 
                    showZero={false}
                    size="small"
                  >
                    <ClockCircleOutlined />
                    ออเดอร์ปัจจุบัน
                  </Badge>
                </Space>
              ),
              children: <OrderList orders={openOrders} loading={loadingOpen} />,
            },
            {
              key: 'history',
              label: (
                <Space>
                  <CheckCircleOutlined />
                  ประวัติ
                </Space>
              ),
              children: <OrderList orders={closedOrders} loading={loadingClosed} />,
            },
          ]}
          className="custom-tabs"
        />
      </div>
    </div>
  );
}