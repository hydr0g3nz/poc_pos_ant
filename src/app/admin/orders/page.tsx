'use client';

import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Modal,
  List,
  Divider,
  message
} from 'antd';
import { 
  EyeOutlined, 
  PrinterOutlined, 
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { adminService } from '@/services/adminService';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function OrdersManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: orders, isLoading } = useSWR('admin-orders', () =>
    adminService.getOrders(50, 0)
  );

  const handleViewDetail = async (orderId: number) => {
    try {
      const response = await adminService.getOrderWithItems(orderId);
      setSelectedOrder(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      message.error('ไม่สามารถโหลดรายละเอียดออเดอร์ได้');
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      message.success('อัพเดทสถานะสำเร็จ');
      mutate('admin-orders');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
  };

  const handlePrintReceipt = async (orderId: number) => {
    try {
      await adminService.printOrderReceipt(orderId);
      message.success('ส่งคำสั่งพิมพ์ใบเสร็จแล้ว');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการพิมพ์ใบเสร็จ');
    }
  };

  const handlePrintQR = async (orderId: number) => {
    try {
      await adminService.printOrderQRCode(orderId);
      message.success('ส่งคำสั่งพิมพ์ QR Code แล้ว');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการพิมพ์ QR Code');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'processing';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const columns = [
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
        <Tag color={getStatusColor(status)}>
          {status === 'open' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
        </Tag>
      ),
    },
    {
      title: 'เวลาสั่ง',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'เวลาปิด',
      dataIndex: 'closed_at',
      key: 'closed_at',
      render: (date: string) => date ? moment(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      width: 300,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            ดู
          </Button>
          {record.status === 'open' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'closed')}
            >
              ปิดออเดอร์
            </Button>
          )}
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(record.id)}
          >
            พิมพ์
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders?.data?.orders?.filter((order: any) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    return true;
  }) || [];

  // Statistics
  const totalOrders = orders?.data?.orders?.length || 0;
  const openOrders = orders?.data?.orders?.filter((order: any) => order.status === 'open')?.length || 0;
  const closedOrders = orders?.data?.orders?.filter((order: any) => order.status === 'closed')?.length || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>จัดการออเดอร์</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => mutate('admin-orders')}
        >
          รีเฟรช
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="ออเดอร์ทั้งหมด"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="กำลังดำเนินการ"
              value={openOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="เสร็จสิ้นแล้ว"
              value={closedOrders}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col>
            <span>สถานะ:</span>
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">ทั้งหมด</Select.Option>
              <Select.Option value="open">กำลังดำเนินการ</Select.Option>
              <Select.Option value="closed">เสร็จสิ้น</Select.Option>
            </Select>
          </Col>
          <Col>
            <span>วันที่:</span>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: filteredOrders.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`รายละเอียดออเดอร์ #${selectedOrder?.id}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            ปิด
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(selectedOrder?.id)}
          >
            พิมพ์ใบเสร็จ
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <strong>โต๊ะ:</strong> {selectedOrder.table_id}
              </Col>
              <Col span={12}>
                <strong>สถานะ:</strong>{' '}
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status === 'open' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>เวลาสั่ง:</strong>{' '}
                {moment(selectedOrder.created_at).format('DD/MM/YYYY HH:mm')}
              </Col>
              <Col span={12}>
                <strong>เวลาปิด:</strong>{' '}
                {selectedOrder.closed_at 
                  ? moment(selectedOrder.closed_at).format('DD/MM/YYYY HH:mm') 
                  : '-'
                }
              </Col>
            </Row>

            <Divider />

            <Title level={4}>รายการอาหาร</Title>
            <List
              dataSource={selectedOrder.items || []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.menu_item?.name || `รายการ #${item.item_id}`}
                    description={`จำนวน: ${item.quantity} | ราคาต่อหน่วย: ฿${item.unit_price?.toLocaleString()}`}
                  />
                  <div className="text-right">
                    <strong>฿{item.subtotal?.toLocaleString()}</strong>
                  </div>
                </List.Item>
              )}
            />

            <Divider />
            
            <div className="text-right">
              <Title level={3}>
                รวมทั้งสิ้น: ฿{selectedOrder.total?.toLocaleString() || 0}
              </Title>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}