"use client";

import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  message,
  Popconfirm,
  InputNumber,
  Switch,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { adminService } from "@/services/adminService";
import moment from "moment";
import { Category, UpdateCategoryRequest } from "@/types";
const { Title } = Typography;

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UpdateCategoryRequest | null>(null);
  const [form] = Form.useForm<UpdateCategoryRequest>();

  const { data: categories, isLoading } = useSWR("admin-categories", () =>
    adminService.getCategories()
  );

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

const handleEdit = (category: UpdateCategoryRequest) => {
  setEditingCategory(category);
  form.setFieldsValue(category); // ส่งทั้ง object
  setIsModalOpen(true);
};

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteCategory(id);
      message.success("ลบหมวดหมู่สำเร็จ");
      mutate("admin-categories");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบหมวดหมู่");
    }
  };

  const handleModalOk = async () => {
    try {
      const values: UpdateCategoryRequest = await form.validateFields();

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, values);
        message.success("แก้ไขหมวดหมู่สำเร็จ");
      } else {
        await adminService.createCategory(values);
        message.success("เพิ่มหมวดหมู่สำเร็จ");
      }

      setIsModalOpen(false);
      mutate("admin-categories");
    } catch (error) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "ชื่อหมวดหมู่",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 200,
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
          <Popconfirm
            title="ต้องการลบหมวดหมู่นี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
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
        <Title level={2}>จัดการหมวดหมู่</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          เพิ่มหมวดหมู่
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={categories?.data || []}
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

      <Modal
        title={editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="ชื่อหมวดหมู่"
            rules={[{ required: true, message: "กรุณากรอกชื่อหมวดหมู่" }]}
          >
            <Input placeholder="กรอกชื่อหมวดหมู่" />
          </Form.Item>
          <Form.Item
            name="description"
            label="คําอธิบาย"
            rules={[{ required: true, message: "กรุณากรอกคําอธิบาย" }]}
          >
            <Input.TextArea placeholder="กรอกคําอธิบาย" />
          </Form.Item>
          {/* display order */}
          <Form.Item name="display_order" label="ลําดับการแสดงผล">
            <InputNumber placeholder="กรอกลําดับการแสดงผล" />
          </Form.Item>
          {/* status */}
          <Form.Item name="is_active" label="สถานะ" valuePropName="checked">
            <Switch
              checkedChildren="เปิดใช้งาน"
              unCheckedChildren="ปิดใช้งาน"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
