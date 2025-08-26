// pages/orders/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Button, Tag, Empty, Spin, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';
import { orderApi } from '@/services/api';

interface Order {
  id: number;
  table_id: number;
  table_number: number;
  status: string;
  items: any[];
  total: number;
  created_at: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Load active orders (open status)
      const response = await orderApi.getByStatus('open', { limit: 20 });
      setOrders(response.data.data?.orders || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดออเดอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'processing';
      case 'preparing': return 'warning';
      case 'ready': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'รอดำเนินการ';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมเสิร์ฟ';
      case 'completed': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">คำสั่งซื้อของฉัน</h1>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadOrders}
            loading={loading}
          >
            รีเฟรช
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Empty description="ไม่มีออเดอร์ที่ต้องติดตาม" />
          </div>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
            dataSource={orders}
            renderItem={(order) => (
              <List.Item>
                <Card
                  className="h-full"
                  title={
                    <div className="flex justify-between items-center">
                      <span>โต๊ะ {order.table_number || order.table_id}</span>
                      <Badge
                        status={getStatusColor(order.status)}
                        text={getStatusText(order.status)}
                      />
                    </div>
                  }
                  extra={
                    <Tag icon={<ClockCircleOutlined />}>
                      {new Date(order.created_at).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Tag>
                  }
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">รายการอาหาร:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>฿{item.subtotal}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="text-sm text-gray-500">
                            และอีก {order.items.length - 3} รายการ...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-bold">รวมทั้งหมด:</span>
                      <span className="font-bold text-lg text-orange-600">
                        ฿{order.total?.toFixed(0) || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;