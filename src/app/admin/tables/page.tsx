'use client';

import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Typography,
  message,
  Popconfirm,
  Tag,
  QRCode
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  QrcodeOutlined,
  PrinterOutlined 
} from '@ant-design/icons';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { adminService } from '@/services/adminService';

const { Title } = Typography;

export default function TablesManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: tables, isLoading } = useSWR('admin-tables', () =>
    adminService.getTables()
  );

  const handleAdd = () => {
    setEditingTable(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (table: any) => {
    setEditingTable(table);
    form.setFieldsValue({
      table_number: table.table_number,
      seating: table.seating,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteTable(id);
      message.success('ลบโต๊ะสำเร็จ');
      mutate('admin-tables');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบโต๊ะ');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTable) {
        await adminService.updateTable(editingTable.id, values);
        message.success('แก้ไขโต๊ะสำเร็จ');
      } else {
        await adminService.createTable(values);
        message.success('เพิ่มโต๊ะสำเร็จ');
      }
      
      setIsModalOpen(false);
      mutate('admin-tables');
    } catch (error) {
      message.error('เกิดข้อผิดพลาด');
    }
  };

  const handleShowQR = (table: any) => {
    setSelectedTable(table);
    setIsQRModalOpen(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'หมายเลขโต๊ะ',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (number: number) => (
        <Tag color="blue" style={{ fontSize: '14px' }}>
          โต๊ะ {number}
        </Tag>
      ),
    },
    {
      title: 'จำนวนที่นั่ง',
      dataIndex: 'seating',
      key: 'seating',
      render: (seating: number) => `${seating} ที่นั่ง`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'ใช้งานได้' : 'ไม่ใช้งาน'}
        </Tag>
      ),
    },
    {
      title: 'QR Code',
      dataIndex: 'qr_code',
      key: 'qr_code',
      render: (qrCode: string, record: any) => (
        <Button
          size="small"
          icon={<QrcodeOutlined />}
          onClick={() => handleShowQR(record)}
        >
          ดู QR
        </Button>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      width: 250,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => handleShowQR(record)}
          >
            QR Code
          </Button>
          <Popconfirm
            title="ต้องการลบโต๊ะนี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>จัดการโต๊ะ</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          เพิ่มโต๊ะใหม่
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tables?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingTable ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะใหม่'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="table_number"
            label="หมายเลขโต๊ะ"
            rules={[
              { required: true, message: 'กรุณากรอกหมายเลขโต๊ะ' },
              { type: 'number', min: 1, message: 'หมายเลขโต๊ะต้องมากกว่า 0' }
            ]}
          >
            <InputNumber
              placeholder="กรอกหมายเลขโต๊ะ"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="seating"
            label="จำนวนที่นั่ง"
            rules={[
              { required: true, message: 'กรุณากรอกจำนวนที่นั่ง' },
              { type: 'number', min: 1, message: 'จำนวนที่นั่งต้องมากกว่า 0' }
            ]}
          >
            <InputNumber
              placeholder="กรอกจำนวนที่นั่ง"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={`QR Code โต๊ะ ${selectedTable?.table_number}`}
        open={isQRModalOpen}
        onCancel={() => setIsQRModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsQRModalOpen(false)}>
            ปิด
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              // Implement print functionality
              window.print();
            }}
          >
            พิมพ์ QR Code
          </Button>,
        ]}
        width={400}
      >
        {selectedTable && (
          <div className="text-center">
            <div className="mb-4">
              <Title level={3}>โต๊ะ {selectedTable.table_number}</Title>
              <p>จำนวนที่นั่ง: {selectedTable.seating} ที่นั่ง</p>
            </div>
            <div className="flex justify-center mb-4">
              <QRCode 
                value={selectedTable.qr_code || `table-${selectedTable.id}`} 
                size={200}
              />
            </div>
            <p className="text-gray-500 text-sm">
              สแกน QR Code เพื่อสั่งอาหาร
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}