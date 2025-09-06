// src/app/admin/tables/page.tsx
"use client";

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
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { adminService } from "@/services/adminService";
import { Table as TableType } from "@/types";
import { useRouter } from "next/navigation";
const { Title } = Typography;

export default function TablesManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: tables, isLoading } = useSWR("admin-tables", () =>
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
      message.success("ลบโต๊ะสำเร็จ");
      mutate("admin-tables");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบโต๊ะ");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingTable) {
        await adminService.updateTable(editingTable.id, values);
        message.success("แก้ไขโต๊ะสำเร็จ");
      } else {
        await adminService.createTable(values);
        message.success("เพิ่มโต๊ะสำเร็จ");
      }

      setIsModalOpen(false);
      mutate("admin-tables");
    } catch (error) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const handleCreateOrder = async (tableId: number) => {
    try {
      // เรียก API สร้าง order สำหรับโต๊ะนี้
      const order = await adminService.createOrderForTable(tableId);
      message.success("เปิดโต๊ะและสร้างออเดอร์สำเร็จ");
      mutate("admin-tables");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเปิดโต๊ะ");
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
      title: "หมายเลขโต๊ะ",
      dataIndex: "table_number",
      key: "table_number",
      render: (number: number) => (
        <Tag color="blue" style={{ fontSize: "14px" }}>
          โต๊ะ {number}
        </Tag>
      ),
    },
    {
      title: "จำนวนที่นั่ง",
      dataIndex: "seating",
      key: "seating",
      render: (seating: number) => `${seating} ที่นั่ง`,
    },
    {
      title: "สถานะ",
      dataIndex: "is_available",
      key: "is_available",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "ใช้งานได้" : "ปิดใช้งาน"}
        </Tag>
      ),
    },
    {
      title: "สถานะการใช้งาน",
      key: "usage_status",
      render: (record: TableType) => {
        // ในอนาคตอาจเช็คจาก orders ที่เปิดอยู่
        const hasOpenOrder = record.current_order?.order_id ? true : false;
        return (
          <Tag color={hasOpenOrder ? "warning" : "success"}>
            {hasOpenOrder ? "มีลูกค้า" : "ว่าง"}
          </Tag>
        );
      },
    },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 300,
      render: (_: any, record: TableType) => {
        const hasOpenOrder = record.current_order?.order_id ? true : false;

        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              แก้ไข
            </Button>

            {record.is_available && !hasOpenOrder && (
              <Button
                type="default"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleCreateOrder(record.id)}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  color: "white",
                }}
              >
                เปิดโต๊ะ
              </Button>
            )}
            {record.current_order?.order_id && hasOpenOrder && (
              <Button
                type="default"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => router.push(`/admin/orders?order_id=${record.current_order?.order_id}`)}
                style={{
                  backgroundColor: "#faad14",
                  borderColor: "#faad14",
                  color: "white",
                }}
              >
                จัดการออเดอร์
              </Button>
            )}
            <Popconfirm
              title="ต้องการลบโต๊ะนี้?"
              description="การลบจะไม่สามารถกู้คืนได้"
              onConfirm={() => handleDelete(record.id)}
              okText="ใช่"
              cancelText="ไม่"
            >
              <Button danger size="small" icon={<DeleteOutlined />}>
                ลบ
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>จัดการโต๊ะ</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
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
        title={editingTable ? "แก้ไขโต๊ะ" : "เพิ่มโต๊ะใหม่"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="table_number"
            label="หมายเลขโต๊ะ"
            rules={[
              { required: true, message: "กรุณากรอกหมายเลขโต๊ะ" },
              { type: "number", min: 1, message: "หมายเลขโต๊ะต้องมากกว่า 0" },
            ]}
          >
            <InputNumber
              placeholder="กรอกหมายเลขโต๊ะ"
              style={{ width: "100%" }}
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="seating"
            label="จำนวนที่นั่ง"
            rules={[
              { required: true, message: "กรุณากรอกจำนวนที่นั่ง" },
              { type: "number", min: 1, message: "จำนวนที่นั่งต้องมากกว่า 0" },
            ]}
          >
            <InputNumber
              placeholder="กรอกจำนวนที่นั่ง"
              style={{ width: "100%" }}
              min={1}
              max={20}
            />
          </Form.Item>
          <Form.Item
            name="is_available"
            label="สถานะการใช้งาน"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="ใช้งาน" unCheckedChildren="ไม่ใช้งาน" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
