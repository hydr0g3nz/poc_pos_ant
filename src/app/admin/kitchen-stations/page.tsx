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
  Switch,
  TableColumnType,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { adminService } from "@/services/adminService";
import { KitchenStation, UpdateKitchenStationRequest } from "@/types";

const { Title } = Typography;

export default function KitchenStationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<KitchenStation | null>(null);
  const [form] = Form.useForm<KitchenStation>();

  const { data: stations, isLoading } = useSWR("admin-kitchen-stations", () =>
    adminService.getKitchenStations()
  );

  const handleAdd = () => {
    setEditingStation(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      is_available: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (station: KitchenStation) => {
    setEditingStation(station);
    form.setFieldsValue(station);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteKitchenStation(id);
      message.success("ลบสถานีครัวสำเร็จ");
      mutate("admin-kitchen-stations");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบสถานีครัว");
    }
  };

  const handleModalOk = async () => {
    try {
      const values: UpdateKitchenStationRequest = await form.validateFields();

      if (editingStation) {
        await adminService.updateKitchenStation(editingStation.id, values);
        message.success("แก้ไขสถานีครัวสำเร็จ");
      } else {
        await adminService.createKitchenStation(values);
        message.success("เพิ่มสถานีครัวสำเร็จ");
      }

      setIsModalOpen(false);
      mutate("admin-kitchen-stations");
    } catch (error) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const columns: TableColumnType<KitchenStation>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "ชื่อสถานีครัว",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "สถานะ",
      dataIndex: "is_available",
      key: "is_available",
      render: (isAvailable: boolean) => (
        isAvailable ? 
          <Tag color="green">พร้อมใช้งาน</Tag> : 
          <Tag color="red">ไม่พร้อมใช้งาน</Tag>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 200,
      render: (_: any, record: KitchenStation) => (
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
            title="ต้องการลบสถานีครัวนี้?"
            description="หากลบแล้วจะไม่สามารถกู้คืนได้"
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
        <Title level={2}>จัดการสถานีครัว</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          เพิ่มสถานีครัว
        </Button>
      </div>

      <Card>
        <Table<KitchenStation>
          columns={columns}
          dataSource={stations?.data || []}
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
        title={editingStation ? "แก้ไขสถานีครัว" : "เพิ่มสถานีครัวใหม่"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="ชื่อสถานีครัว"
            rules={[
              { required: true, message: "กรุณากรอกชื่อสถานีครัว" },
              { min: 1, max: 100, message: "ชื่อสถานีครัวต้องมีความยาว 1-100 ตัวอักษร" }
            ]}
          >
            <Input placeholder="เช่น: สถานีผัด, สถานีทอด, สถานีปิ้งย่าง" />
          </Form.Item>

          <Form.Item 
            name="is_available" 
            label="สถานะการใช้งาน" 
            valuePropName="checked"
          >
            <Switch
              checkedChildren="พร้อมใช้งาน"
              unCheckedChildren="ไม่พร้อมใช้งาน"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}