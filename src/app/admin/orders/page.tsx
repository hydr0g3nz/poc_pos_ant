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
  message,
  Descriptions,
  Popconfirm,
  Drawer,
  Form,
  InputNumber,
  Radio
} from 'antd';
import { 
  EyeOutlined, 
  PrinterOutlined, 
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  StopOutlined,
  CalculatorOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { adminService } from '@/services/adminService';
import moment from 'moment';
import EditOrderModal from '@/components/admin/EditOrderModal'; // เพิ่ม import
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function OrdersManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [orderTotal, setOrderTotal] = useState<any>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [paymentForm] = Form.useForm();
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const { data: orders, isLoading } = useSWR('admin-orders', () =>
    adminService.getOrders(50, 0)
  );
  const handleEditOrder = async (orderId: number) => {
    try {
      const response = await adminService.getOrderWithItems(orderId);
      setEditingOrder(response.data);
      setIsEditModalOpen(true);
    } catch (error) {
      message.error('ไม่สามารถโหลดรายละเอียดออเดอร์ได้');
    }
  };
    const handleEditSaved = () => {
    setIsEditModalOpen(false);
    setEditingOrder(null);
    mutate('admin-orders');
    message.success('แก้ไขออเดอร์สำเร็จ');
  };
  const handleViewDetail = async (orderId: number) => {
    try {
      const response = await adminService.getOrderWithItems(orderId);
      setSelectedOrder(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      message.error('ไม่สามารถโหลดรายละเอียดออเดอร์ได้');
    }
  };

  const handleCheckBill = async (orderId: number) => {
    try {
      setLoadingOrderId(orderId);
      const [orderResponse, totalResponse] = await Promise.all([
        adminService.getOrderWithItems(orderId),
        adminService.calculateOrderTotal(orderId)
      ]);
      
      setSelectedOrder(orderResponse.data);
      setOrderTotal(totalResponse.data);
      setIsBillModalOpen(true);
    } catch (error: any) {
      message.error(error.message || 'ไม่สามารถคำนวณยอดรวมได้');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setLoadingOrderId(orderId);
      await adminService.cancelOrder(orderId);
      message.success('ยกเลิกออเดอร์สำเร็จ');
      mutate('admin-orders');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการยกเลิกออเดอร์');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setLoadingOrderId(orderId);
      await adminService.updateOrderStatus(orderId, { status: newStatus });
      message.success('อัพเดทสถานะสำเร็จ');
      mutate('admin-orders');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleProcessPayment = async (values: any) => {
    try {
      if (!orderTotal) return;
      
      await adminService.processPayment({
        order_id: orderTotal.order_id,
        amount: orderTotal.total,
        method: values.method
      });
      
      message.success('ชำระเงินสำเร็จ');
      setIsPaymentDrawerOpen(false);
      setIsBillModalOpen(false);
      paymentForm.resetFields();
      mutate('admin-orders');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
    }
  };

  const handlePrintReceipt = async (orderId: number) => {
    try {
      await adminService.printOrderReceipt(orderId);
      message.success('ส่งคำสั่งพิมพ์ใบเสร็จแล้ว');
    } catch (error: any) {
      message.error(error.message || 'เกิดข้อผิดพลาดในการพิมพ์ใบเสร็จ');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'processing';
      case 'closed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'กำลังดำเนินการ';
      case 'closed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
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
          {getStatusText(status)}
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
      width: 450, // เพิ่มความกว้าง
      render: (_: any, record: any) => (
        <Space wrap>
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
              icon={<EditOutlined />}
              type="default"
              onClick={() => handleEditOrder(record.id)}
            >
              แก้ไข
            </Button>
          )}
          
          <Button
            size="small"
            icon={<CalculatorOutlined />}
            type="primary"
            ghost
            loading={loadingOrderId === record.id}
            onClick={() => handleCheckBill(record.id)}
          >
            เช็คบิล
          </Button>

          {record.status === 'open' && (
            <>
              <Button
                size="small"
                type="primary"
                loading={loadingOrderId === record.id}
                onClick={() => handleUpdateStatus(record.id, 'closed')}
              >
                ปิดออเดอร์
              </Button>
              
              <Popconfirm
                title="ยกเลิกออเดอร์"
                description="คุณแน่ใจหรือไม่ที่จะยกเลิกออเดอร์นี้?"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleCancelOrder(record.id)}
                okText="ยกเลิก"
                cancelText="ไม่"
                okButtonProps={{ danger: true }}
              >
                <Button
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  loading={loadingOrderId === record.id}
                >
                  ยกเลิก
                </Button>
              </Popconfirm>
            </>
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
  const cancelledOrders = orders?.data?.orders?.filter((order: any) => order.status === 'cancelled')?.length || 0;

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
        <Col span={6}>
          <Card>
            <Statistic
              title="ออเดอร์ทั้งหมด"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="กำลังดำเนินการ"
              value={openOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="เสร็จสิ้นแล้ว"
              value={closedOrders}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="ยกเลิกแล้ว"
              value={cancelledOrders}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#cf1322' }}
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
              <Select.Option value="cancelled">ยกเลิก</Select.Option>
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
                  {getStatusText(selectedOrder.status)}
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

      {/* Bill Check Modal */}
      <Modal
        title={`เช็คบิล ออเดอร์ #${selectedOrder?.id}`}
        open={isBillModalOpen}
        onCancel={() => setIsBillModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsBillModalOpen(false)}>
            ปิด
          </Button>,
          <Button
            key="payment"
            type="primary"
            icon={<CreditCardOutlined />}
            disabled={selectedOrder?.status !== 'closed'}
            onClick={() => {
              paymentForm.setFieldValue('amount', orderTotal?.total);
              setIsPaymentDrawerOpen(true);
            }}
          >
            ชำระเงิน
          </Button>,
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(selectedOrder?.id)}
          >
            พิมพ์บิล
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && orderTotal && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ออเดอร์" span={1}>
                #{selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="โต๊ะ" span={1}>
                {selectedOrder.table_id}
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ" span={1}>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="เวลาสั่ง" span={1}>
                {moment(selectedOrder.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>รายการสั่ง</Title>
            <List
              dataSource={orderTotal.items || []}
              renderItem={(item: any) => (
                <List.Item className="flex justify-between">
                  <div>
                    <Text strong>{item.menu_item?.name || `รายการ #${item.item_id}`}</Text>
                    <br />
                    <Text type="secondary">
                      {item.quantity} x ฿{item.unit_price?.toLocaleString()}
                    </Text>
                  </div>
                  <Text strong>฿{item.subtotal?.toLocaleString()}</Text>
                </List.Item>
              )}
            />

            <Divider />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>ยอดรวม:</Text>
                <Text>฿{orderTotal.total?.toLocaleString()}</Text>
              </div>
              <div className="flex justify-between">
                <Text>จำนวนรายการ:</Text>
                <Text>{orderTotal.item_count} รายการ</Text>
              </div>
              <Divider />
              <div className="flex justify-between">
                <Title level={4}>ยอดสุทธิ:</Title>
                <Title level={4} className="text-green-600">
                  ฿{orderTotal.total?.toLocaleString()}
                </Title>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Drawer */}
      <Drawer
        title="ชำระเงิน"
        placement="right"
        open={isPaymentDrawerOpen}
        onClose={() => setIsPaymentDrawerOpen(false)}
        width={400}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleProcessPayment}
        >
          <Form.Item label="ยอดรวม">
            <Text strong className="text-xl text-green-600">
              ฿{orderTotal?.total?.toLocaleString()}
            </Text>
          </Form.Item>

          <Form.Item
            name="amount"
            label="จำนวนเงิน"
            rules={[{ required: true, message: 'กรุณาระบุจำนวนเงิน' }]}
          >
            <InputNumber
              className="w-full"
              placeholder="จำนวนเงิน"
              min={0}
              formatter={value => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/฿\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="method"
            label="วิธีการชำระเงิน"
            rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="cash">เงินสด</Radio>
                <Radio value="credit_card">บัตรเครดิต</Radio>
                <Radio value="wallet">กระเป๋าเงินดิจิทัล</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              ยืนยันการชำระเงิน
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
        <EditOrderModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleEditSaved}
        order={editingOrder}
      />
    </div>
  );
}