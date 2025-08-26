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
  Select, 
  Typography,
  message,
  Popconfirm,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { adminService } from '@/services/adminService';

const { Title } = Typography;
const { Search } = Input;

export default function MenuManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const { data: menuItems, isLoading } = useSWR('admin-menu-items', () =>
    adminService.getMenuItems(100, 0)
  );

  const { data: categories } = useSWR('admin-categories', () =>
    adminService.getCategories()
  );

  const handleAddItem = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      kitchen_station_id: 1, // Default value, you might want to get this from the item
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await adminService.deleteMenuItem(id);
      message.success('ลบเมนูสำเร็จ');
      mutate('admin-menu-items');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการลบเมนู');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingItem) {
        await adminService.updateMenuItem(editingItem.id, values);
        message.success('แก้ไขเมนูสำเร็จ');
      } else {
        await adminService.createMenuItem(values);
        message.success('เพิ่มเมนูสำเร็จ');
      }
      
      setIsModalOpen(false);
      mutate('admin-menu-items');
    } catch (error) {
      message.error('เกิดข้อผิดพลาด');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'ชื่อเมนู',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'หมวดหมู่',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => (
        <Tag color="blue">{category?.name || 'ไม่ระบุ'}</Tag>
      ),
    },
    {
      title: 'คำอธิบาย',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || 'ไม่มีคำอธิบาย',
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `฿${price?.toLocaleString()}`,
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ต้องการลบเมนูนี้?"
            onConfirm={() => handleDeleteItem(record.id)}
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
        <Title level={2}>จัดการเมนู</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddItem}
        >
          เพิ่มเมนูใหม่
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Search
            placeholder="ค้นหาเมนู..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={menuItems?.data?.items || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: menuItems?.data?.total || 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="ชื่อเมนู"
            rules={[{ required: true, message: 'กรุณากรอกชื่อเมนู' }]}
          >
            <Input placeholder="กรอกชื่อเมนู" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="หมวดหมู่"
            rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}
          >
            <Select placeholder="เลือกหมวดหมู่">
              {categories?.data?.map((category: any) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="kitchen_station_id"
            label="สถานีครัว"
            rules={[{ required: true, message: 'กรุณาเลือกสถานีครัว' }]}
          >
            <Select placeholder="เลือกสถานีครัว">
              <Select.Option value={1}>สถานีหลัก</Select.Option>
              <Select.Option value={2}>สถานีเครื่องดื่ม</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="ราคา"
            rules={[
              { required: true, message: 'กรุณากรอกราคา' },
              { type: 'number', min: 0, message: 'ราคาต้องมากกว่าหรือเท่ากับ 0' }
            ]}
          >
            <InputNumber
              placeholder="กรอกราคา"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              formatter={value => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/฿\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="คำอธิบาย"
          >
            <Input.TextArea
              placeholder="กรอกคำอธิบายเมนู"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}