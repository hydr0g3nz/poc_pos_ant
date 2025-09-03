// src/app/admin/options/page.tsx
"use client";

import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Switch,
  InputNumber,
  Divider,
  List,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { menuOptionsService } from "@/services/menuOptionsService";
import {
  OptionWithValues,
  CreateOptionWithValuesRequest,
  UpdateOptionWithValuesRequest,
} from "@/types";

const { Title, Text } = Typography;
const { Search } = Input;

export default function OptionsManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<OptionWithValues | null>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<OptionWithValues | null>(
    null
  );
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const { data: options, isLoading } = useSWR("menu-options-with-values", () =>
    menuOptionsService.getOptionsWithValues()
  );

  const handleViewDetail = async (id: number) => {
    try {
      const response = await menuOptionsService.getOptionWithValues(id);
      setSelectedOption(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดตัวเลือกได้");
    }
  };

  const handleAddOption = () => {
    setEditingOption(null);
    form.resetFields();
    form.setFieldsValue({
      values: [
        { name: "", additional_price: 0, is_default: false, display_order: 1 },
      ],
    });
    setIsModalOpen(true);
  };

  const handleEditOption = async (option: OptionWithValues) => {
    try {
      const response = await menuOptionsService.getOptionWithValues(option.id);
      const fullOption = response.data;

      setEditingOption(fullOption);
      form.setFieldsValue({
        name: fullOption.name,
        type: fullOption.type,
        is_required: fullOption.is_required,
        values: fullOption.values.map((v) => ({
          id: v.id,
          name: v.name,
          additional_price: v.additional_price,
          is_default: v.is_default,
          display_order: v.display_order,
          action: "update",
        })),
      });

      setIsModalOpen(true);
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดตัวเลือกได้");
    }
  };

  const handleDeleteOption = async (id: number) => {
    try {
      await menuOptionsService.deleteOptionWithValues(id);
      message.success("ลบตัวเลือกสำเร็จ");
      mutate("menu-options-with-values");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบตัวเลือก");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const optionData:
        | CreateOptionWithValuesRequest
        | UpdateOptionWithValuesRequest = {
        name: values.name,
        type: values.type,
        is_required: values.is_required,
        values: values.values.map((v: any, index: number) => ({
          ...(editingOption && v.id ? { id: v.id } : {}),
          name: v.name,
          additional_price: v.additional_price,
          is_default: v.is_default,
          display_order: v.display_order || index + 1,
          action: v.action || "add",
        })),
      };

      if (editingOption) {
        await menuOptionsService.updateOptionWithValues(
          editingOption.id,
          optionData as UpdateOptionWithValuesRequest
        );
        message.success("แก้ไขตัวเลือกสำเร็จ");
      } else {
        await menuOptionsService.createOptionWithValues(
          optionData as CreateOptionWithValuesRequest
        );
        message.success("เพิ่มตัวเลือกสำเร็จ");
      }

      setIsModalOpen(false);
      mutate("menu-options-with-values");
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
      title: "ชื่อตัวเลือก",
      dataIndex: "name",
      key: "name",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: OptionWithValues) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "single" ? "blue" : "green"}>
          {type === "single" ? "เลือกได้ 1 ตัวเลือก" : "เลือกได้หลายตัวเลือก"}
        </Tag>
      ),
    },
    {
      title: "บังคับเลือก",
      dataIndex: "is_required",
      key: "is_required",
      render: (isRequired: boolean) => (
        <Tag color={isRequired ? "red" : "default"}>
          {isRequired ? "บังคับเลือก" : "ไม่บังคับ"}
        </Tag>
      ),
    },
    {
      title: "จำนวนตัวเลือกย่อย",
      dataIndex: "values",
      key: "values_count",
      render: (values: any[]) => (
        <span className="font-medium">{values?.length || 0} ตัวเลือก</span>
      ),
    },
    {
      title: "ตัวเลือกย่อย",
      dataIndex: "values",
      key: "values_preview",
      render: (values: any[]) => (
        <div className="max-w-xs">
          {values?.slice(0, 3).map((value: any, index: number) => (
            <Tag key={index} className="mb-1">
              {value.name}
              {parseFloat(value.additional_price) > 0 && (
                <span className="text-green-600 ml-1">
                  (+฿{parseFloat(value.additional_price).toLocaleString()})
                </span>
              )}
            </Tag>
          ))}
          {values?.length > 3 && (
            <Tag className="mb-1">+{values.length - 3} อื่นๆ</Tag>
          )}
        </div>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 250,
      render: (_: any, record: OptionWithValues) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            ดู
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditOption(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ต้องการลบตัวเลือกนี้?"
            description="การลบตัวเลือกจะส่งผลต่อเมนูที่ใช้ตัวเลือกนี้"
            onConfirm={() => handleDeleteOption(record.id)}
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
        <Title level={2}>จัดการตัวเลือกเมนู</Title>
        <Space>
          <Button onClick={() => (window.location.href = "/admin/menu")}>
            กลับไปจัดการเมนู
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddOption}
          >
            เพิ่มตัวเลือกใหม่
          </Button>
        </Space>
      </div>

      <Card>
        <div className="mb-4">
          <Search
            placeholder="ค้นหาตัวเลือก..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={options?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
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
        title={editingOption ? "แก้ไขตัวเลือก" : "เพิ่มตัวเลือกใหม่"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="ชื่อตัวเลือก"
                rules={[{ required: true, message: "กรุณากรอกชื่อตัวเลือก" }]}
              >
                <Input placeholder="เช่น ระดับความเผ็ด, ความหวาน, เพิ่มผัก" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="ประเภท"
                rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
              >
                <Select placeholder="เลือกประเภท">
                  <Select.Option value="single">
                    เลือกได้ 1 ตัวเลือก
                  </Select.Option>
                  <Select.Option value="multiple">
                    เลือกได้หลายตัวเลือก
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="is_required"
            label="บังคับเลือก"
            valuePropName="checked"
          >
            <Switch checkedChildren="บังคับ" unCheckedChildren="ไม่บังคับ" />
          </Form.Item>

          <Divider>ตัวเลือกย่อย</Divider>

          <Form.List name="values">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="mb-4"
                    title={`ตัวเลือกที่ ${index + 1}`}
                    extra={
                      fields.length > 1 ? (
                        <Button
                          type="link"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        >
                          ลบ
                        </Button>
                      ) : null
                    }
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "name"]}
                          label="ชื่อ"
                          rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                        >
                          <Input placeholder="เช่น เผ็ดน้อย, เผ็ดปานกลาง" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, "additional_price"]}
                          label="ราคาเพิ่ม (฿)"
                          rules={[{ required: true, message: "กรุณากรอกราคา" }]}
                        >
                          <InputNumber
                            placeholder="0"
                            min={0}
                            step={0.01}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...field}
                          name={[field.name, "display_order"]}
                          label="ลำดับ"
                        >
                          <InputNumber
                            placeholder="1"
                            min={1}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...field}
                          name={[field.name, "is_default"]}
                          label="ค่าเริ่มต้น"
                          valuePropName="checked"
                        >
                          <Checkbox>เป็นค่าเริ่มต้น</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      name: "",
                      additional_price: 0,
                      is_default: false,
                      display_order: fields.length + 1,
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  เพิ่มตัวเลือกย่อย
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`รายละเอียด: ${selectedOption?.name}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            ปิด
          </Button>,
        ]}
        width={700}
      >
        {selectedOption && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <strong>ชื่อตัวเลือก:</strong> {selectedOption.name}
              </div>
              <div>
                <strong>ประเภท:</strong>{" "}
                <Tag
                  color={selectedOption.type === "single" ? "blue" : "green"}
                >
                  {selectedOption.type === "single"
                    ? "เลือกได้ 1 ตัวเลือก"
                    : "เลือกได้หลายตัวเลือก"}
                </Tag>
              </div>
              <div>
                <strong>บังคับเลือก:</strong>{" "}
                <Tag color={selectedOption.is_required ? "red" : "default"}>
                  {selectedOption.is_required ? "บังคับเลือก" : "ไม่บังคับ"}
                </Tag>
              </div>
              <div>
                <strong>จำนวนตัวเลือกย่อย:</strong>{" "}
                {selectedOption.values?.length || 0}
              </div>
            </div>

            <Divider />

            <Title level={4}>ตัวเลือกย่อย</Title>
            {selectedOption.values && selectedOption.values.length > 0 ? (
              <List
                dataSource={selectedOption.values}
                renderItem={(value, index) => (
                  <List.Item className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{value.name}</span>
                      {value.is_default && (
                        <Tag color="gold" className="ml-2">
                          ค่าเริ่มต้น
                        </Tag>
                      )}
                    </div>
                    <div>
                      {value.additional_price > 0 ? (
                        <span className="text-green-600 font-medium">
                          +฿{value.additional_price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">ฟรี</span>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                ไม่มีตัวเลือกย่อย
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
