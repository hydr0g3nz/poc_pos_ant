'use client';

import { Card, Empty, Tabs, Tag, Typography, Space, Button, List, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { customerService } from '@/services/customerService';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;

export default function OrdersPage() {
  const { data: openOrders, isLoading: loadingOpen } = useSWR('orders-open', () =>
    customerService.getOrdersByStatus('open', 50, 1)
  );

  const { data: closedOrders, isLoading: loadingClosed } = useSWR('orders-closed', () =>
    customerService.getOrdersByStatus('closed', 50, 1)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'processing';
      case 'preparing': return 'warning';
      case 'ready': return 'success';
      case 'served': return 'default';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <ClockCircleOutlined />;
      case 'preparing': return <LoadingOutlined />;
      case 'ready': return <CheckCircleOutlined />;
      case 'served': return <CheckCircleOutlined />;
      case 'closed': return <CheckCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const OrderList = ({ orders, loading }: { orders: any; loading: boolean }) => (
    <Spin spinning={loading}>
      {orders?.data && orders.data.length > 0 ? (
        <List
          dataSource={orders.data}
          renderItem={(order: any) => (
            <List.Item>
              <Card className="w-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Title level={4}>ออเดอร์ #{order.id}</Title>
                    <Space>
                      <Text type="secondary">
                        โต๊ะ {order.table?.table_number}
                      </Text>
                      <Text type="secondary">
                        {moment(order.created_at).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </Space>
                  </div>
                  <Tag 
                    color={getStatusColor(order.status)} 
                    icon={getStatusIcon(order.status)}
                  >
                    {order.status === 'open' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                  </Tag>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <Paragraph strong>รายการอาหาร:</Paragraph>
                    <List
                      size="small"
                      dataSource={order.items}
                      renderItem={(item: any) => (
                        <List.Item className="px-0">
                          <div className="flex justify-between w-full">
                            <span>{item.menu_item?.name || `รายการ #${item.item_id}`}</span>
                            <Space>
                              <span>x{item.quantity}</span>
                              <span className="text-orange-600 font-medium">
                                ฿{item.subtotal?.toLocaleString()}
                              </span>
                            </Space>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    {order.total && (
                      <div className="text-lg font-bold text-orange-600">
                        รวม: ฿{order.total.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Space>
                    <Button onClick={() => window.location.href = `/customer/orders/${order.id}`}>
                      ดูรายละเอียด
                    </Button>
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="ไม่มีออเดอร์" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Spin>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Title level={1}>ออเดอร์ของฉัน</Title>
          <Paragraph>ตรวจสอบสถานะออเดอร์และประวัติการสั่งอาหาร</Paragraph>
        </div>

        <Tabs
          defaultActiveKey="current"
          items={[
            {
              key: 'current',
              label: (
                <Space>
                  <ClockCircleOutlined />
                  ออเดอร์ปัจจุบัน
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
        />
      </div>
    </div>
  );
}