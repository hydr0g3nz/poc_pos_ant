'use client';

import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  List, 
  Avatar,
  Progress,
  Statistic,
  Select,
  message
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { adminService } from '@/services/adminService';
import moment from 'moment';

const { Title, Text } = Typography;

// Mock kitchen service - you'll need to implement this based on your API
const kitchenService = {
  getKitchenQueue: async () => {
    // Mock data - replace with actual API call
    return {
      data: [
        {
          id: 1,
          order_id: 101,
          item_id: 1,
          menu_item: { name: 'ข้าวผัดกุ้ง' },
          quantity: 2,
          status: 'pending',
          created_at: new Date().toISOString(),
          table_number: 5
        },
        {
          id: 2,
          order_id: 102,
          item_id: 2,
          menu_item: { name: 'ต้มยำกุ้ง' },
          quantity: 1,
          status: 'preparing',
          created_at: new Date().toISOString(),
          table_number: 3
        },
      ]
    };
  },
  updateOrderItemStatus: async (orderItemId: number, status: string) => {
    // Mock API call
    return { data: { id: orderItemId, status } };
  },
};

export default function KitchenManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: kitchenQueue, isLoading } = useSWR('kitchen-queue', () =>
    kitchenService.getKitchenQueue()
  );

  const handleUpdateStatus = async (orderItemId: number, newStatus: string) => {
    try {
      await kitchenService.updateOrderItemStatus(orderItemId, newStatus);
      message.success(`อัพเดทสถานะเป็น ${getStatusText(newStatus)} แล้ว`);
      mutate('kitchen-queue');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'preparing': return 'processing';
      case 'ready': return 'success';
      case 'served': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมเสิร์ฟ';
      case 'served': return 'เสิร์ฟแล้ว';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'preparing': return <FireOutlined />;
      case 'ready': return <CheckCircleOutlined />;
      case 'served': return <CheckCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    return nextStatus ? getStatusText(nextStatus) : null;
  };

  const filteredQueue = kitchenQueue?.data?.filter((item: any) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  }) || [];

  // Statistics
  const pendingCount = kitchenQueue?.data?.filter((item: any) => item.status === 'pending')?.length || 0;
  const preparingCount = kitchenQueue?.data?.filter((item: any) => item.status === 'preparing')?.length || 0;
  const readyCount = kitchenQueue?.data?.filter((item: any) => item.status === 'ready')?.length || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>จัดการครัว</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => mutate('kitchen-queue')}
        >
          รีเฟรช
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="รอดำเนินการ"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#666' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="กำลังเตรียม"
              value={preparingCount}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="พร้อมเสิร์ฟ"
              value={readyCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card className="mb-4">
        <Space>
          <Text>กรองตามสถานะ:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">ทั้งหมด</Select.Option>
            <Select.Option value="pending">รอดำเนินการ</Select.Option>
            <Select.Option value="preparing">กำลังเตรียม</Select.Option>
            <Select.Option value="ready">พร้อมเสิร์ฟ</Select.Option>
            <Select.Option value="served">เสิร์ฟแล้ว</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* Kitchen Queue */}
      <Row gutter={[16, 16]}>
        {filteredQueue.map((item: any) => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <Card
              size="small"
              className={`h-full ${item.status === 'ready' ? 'border-green-500 shadow-lg' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <Space>
                  <Avatar size="small">{item.table_number}</Avatar>
                  <Text strong>โต๊ะ {item.table_number}</Text>
                </Space>
                <Tag 
                  color={getStatusColor(item.status)}
                  icon={getStatusIcon(item.status)}
                >
                  {getStatusText(item.status)}
                </Tag>
              </div>

              <div className="mb-3">
                <Text strong className="block">{item.menu_item?.name}</Text>
                <Text type="secondary">จำนวน: {item.quantity}</Text>
              </div>

              <div className="mb-3">
                <Text type="secondary" className="text-sm">
                  ออเดอร์ #{item.order_id} • {moment(item.created_at).fromNow()}
                </Text>
              </div>

              {getNextStatus(item.status) && (
                <Button
                  type="primary"
                  size="small"
                  block
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleUpdateStatus(item.id, getNextStatus(item.status)!)}
                  className={item.status === 'preparing' ? 'bg-green-500 border-green-500' : ''}
                >
                  {getNextStatusText(item.status)}
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {filteredQueue.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Text type="secondary">ไม่มีรายการในคิว</Text>
          </div>
        </Card>
      )}
    </div>
  );
}