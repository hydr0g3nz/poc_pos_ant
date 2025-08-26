'use client';

import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Table, 
  Tag, 
  Space,
  Progress,
  List,
  Avatar,
  Button
} from 'antd';
import { 
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import { adminService } from '@/services/adminService';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function AdminDashboard() {
  const router = useRouter();

  const { data: orders } = useSWR('admin-orders', () =>
    adminService.getOrders(10, 0)
  );

  const { data: tables } = useSWR('admin-tables', () =>
    adminService.getTables()
  );

  // Mock data for statistics - in real app, you'd get this from API
  const stats = {
    todayOrders: 47,
    todayRevenue: 12500,
    activeOrders: orders?.data?.orders?.filter((order: any) => order.status === 'open')?.length || 0,
    totalTables: tables?.data?.length || 0,
  };

  const recentOrders = orders?.data?.orders?.slice(0, 5) || [];

  const orderColumns = [
    {
      title: 'ออเดอร์',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`,
    },
    {
      title: 'โต๊ะ',
      dataIndex: 'table_id',
      key: 'table_id',
      render: (tableId: number) => `โต๊ะ ${tableId}`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'open' ? 'processing' : 'default'}>
          {status === 'open' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
        </Tag>
      ),
    },
    {
      title: 'เวลา',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => moment(date).format('HH:mm'),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          size="small"
          onClick={() => router.push(`/admin/orders/${record.id}`)}
        >
          ดู
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={2}>แดshบอร์ด</Title>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ออเดอร์วันนี้"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้วันนี้"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              suffix="บาท"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ออเดอร์ที่กำลังดำเนินการ"
              value={stats.activeOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="จำนวนโต๊ะทั้งหมด"
              value={stats.totalTables}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Orders */}
        <Col xs={24} lg={16}>
          <Card title="ออเดอร์ล่าสุด" extra={
            <Button onClick={() => router.push('/admin/orders')}>
              ดูทั้งหมด
            </Button>
          }>
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" className="w-full">
            <Card title="สถิติครัว">
              <Space direction="vertical" className="w-full">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>กำลังเตรียม</span>
                    <span>5 รายการ</span>
                  </div>
                  <Progress percent={30} size="small" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>พร้อมเสิร์ฟ</span>
                    <span>3 รายการ</span>
                  </div>
                  <Progress percent={60} size="small" status="active" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>เสิร์ฟแล้ว</span>
                    <span>12 รายการ</span>
                  </div>
                  <Progress percent={80} size="small" />
                </div>
              </Space>
            </Card>

            <Card title="โต๊ะที่ใช้งาน">
              <List
                size="small"
                dataSource={Array.isArray(tables?.data) ? tables.data.slice(0, 4) : []}
                // dataSource={tables?.data?.slice(0, 4)}
                renderItem={(table: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{table.table_number}</Avatar>}
                      title={`โต๊ะ ${table.table_number}`}
                      description={`${table.seating} ที่นั่ง`}
                    />
                    <Tag color={table.is_active ? 'success' : 'default'}>
                      {table.is_active ? 'ว่าง' : 'ใช้งาน'}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}