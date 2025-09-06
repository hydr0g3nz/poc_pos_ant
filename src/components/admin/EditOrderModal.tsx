// src/components/admin/EditOrderModal.tsx

"use client";

import {
  Modal,
  Form,
  InputNumber,
  Button,
  Space,
  List,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Popconfirm,
  message,
  Spin,
  Empty,
  Alert,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { customerService } from "@/services/customerService";
import {
  OrderDetailResponse,
  ManageOrderItemListRequest,
  ManageOrderItemItemRequest,
} from "@/types";

const { Title, Text } = Typography;

interface EditOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  order: OrderDetailResponse | null;
}

interface OrderItemForm {
  items: {
    order_item_id?: number;
    menu_item_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    action?: "update" | "delete";
  }[];
}

export default function EditOrderModal({
  open,
  onCancel,
  onSave,
  order,
}: EditOrderModalProps) {
  const [form] = Form.useForm<OrderItemForm>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderItemsToDelete, setOrderItemsToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (open && order?.items) {
      // Set form data from existing order items
      const formData: OrderItemForm = {
        items: order.items.map((item) => ({
          order_item_id: item.id,
          menu_item_id: item.item_id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };
      form.setFieldsValue(formData);
      setOrderItemsToDelete([]);
    }
  }, [open, order, form]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      if (!order) return;

      // Prepare items for API
      const itemsToManage: ManageOrderItemItemRequest[] = [];

      // Add updated items
      values.items?.forEach((item) => {
        if (!orderItemsToDelete.includes(item.order_item_id || 0)) {
          itemsToManage.push({
            order_item_id: item.order_item_id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            action: "update",
          });
        }
      });

      // Add deleted items
      orderItemsToDelete.forEach((itemId) => {
        const originalItem = order.items.find((item) => item.id === itemId);
        if (originalItem) {
          itemsToManage.push({
            order_item_id: itemId,
            menu_item_id: originalItem.item_id,
            quantity: 0, // quantity 0 means delete
            action: "delete",
          });
        }
      });

      if (itemsToManage.length > 0) {
        const manageRequest: ManageOrderItemListRequest = {
          order_id: order.id,
          items: itemsToManage,
        };

        await customerService.manageOrderItems(manageRequest);
      }

      message.success("อัพเดทออเดอร์สำเร็จ");
      onSave();
    } catch (error: any) {
      message.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = (index: number, itemId?: number) => {
    if (itemId) {
      setOrderItemsToDelete((prev) => [...prev, itemId]);
    }

    // Remove from form
    const currentItems = form.getFieldValue("items") || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    form.setFieldValue("items", newItems);
  };

  const handleRestoreItem = (itemId: number) => {
    setOrderItemsToDelete((prev) => prev.filter((id) => id !== itemId));

    // Add back to form
    const originalItem = order?.items.find((item) => item.id === itemId);
    if (originalItem) {
      const currentItems = form.getFieldValue("items") || [];
      const newItems = [
        ...currentItems,
        {
          order_item_id: originalItem.id,
          menu_item_id: originalItem.item_id,
          name: originalItem.name,
          quantity: originalItem.quantity,
          unit_price: originalItem.unit_price,
        },
      ];
      form.setFieldValue("items", newItems);
    }
  };

  const calculateTotal = () => {
    const items = form.getFieldValue("items") || [];
    return items
      .filter((_: any, index: number) => {
        const item = items[index];
        return !orderItemsToDelete.includes(item?.order_item_id || 0);
      })
      .reduce((total: number, item: any) => {
        return total + (item?.unit_price || 0) * (item?.quantity || 0);
      }, 0);
  };

  const getMenuUrl = () => {
    if (!order) return "#";
    // สร้าง URL ไปหน้าเมนูลูกค้า - ใช้ order id หรือ qr_code ตามที่ API รองรับ
    return `/customer/${order.qr_code}/menu`;
  };

  const deletedItems =
    order?.items.filter((item) => orderItemsToDelete.includes(item.id)) || [];

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span>
            แก้ไขออเดอร์ #{order?.id} - โต๊ะ {order?.table_id}
          </span>
          <Tag color="blue">
            สถานะ: {order?.status === "open" ? "เปิด" : "ปิด"}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          ยกเลิก
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={handleSave}
          disabled={!form.getFieldValue("items")?.length}
        >
          บันทึกการเปลี่ยนแปลง
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        <div className="space-y-4">
          {/* Add Menu Item Section */}
          <Card title="เพิ่มรายการอาหาร" size="small">
            <Alert
              message="เพิ่มเมนูใหม่"
              description="คลิกปุ่มด้านล่างเพื่อไปยังหน้าเมนูและเลือกรายการอาหารที่ต้องการเพิ่ม"
              type="info"
              showIcon
              className="mb-3"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                window.open(getMenuUrl(), "_blank");
              }}
            >
              เพิ่มเมนูอาหาร
              <LinkOutlined />
            </Button>
          </Card>

          {/* Current Order Items Form */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>รายการในออเดอร์</span>
                <Text strong className="text-lg text-green-600">
                  รวม: ฿{calculateTotal().toLocaleString()}
                </Text>
              </div>
            }
            size="small"
          >
            <Form form={form} layout="vertical">
              <Form.List name="items">
                {(fields, { remove }) => (
                  <>
                    {fields.length > 0 ? (
                      <List
                        dataSource={fields}
                        renderItem={(field, index) => {
                          const item = form.getFieldValue([
                            "items",
                            field.name,
                          ]);
                          const isDeleted = orderItemsToDelete.includes(
                            item?.order_item_id || 0
                          );

                          if (isDeleted) return null;

                          return (
                            <List.Item
                              key={field.key}
                              actions={[
                                <Form.Item
                                  key="quantity"
                                  name={[field.name, "quantity"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "กรุณาระบุจำนวน",
                                    },
                                    {
                                      min: 1,
                                      type: "number",
                                      message: "จำนวนต้องมากกว่า 0",
                                    },
                                  ]}
                                  className="mb-0"
                                >
                                  <InputNumber
                                    min={1}
                                    placeholder="จำนวน"
                                    style={{ width: 80 }}
                                  />
                                </Form.Item>,
                                <Popconfirm
                                  key="delete"
                                  title="ลบรายการ"
                                  description="คุณแน่ใจหรือไม่ที่จะลบรายการนี้?"
                                  onConfirm={() =>
                                    handleDeleteItem(
                                      field.name,
                                      item?.order_item_id
                                    )
                                  }
                                  okText="ลบ"
                                  cancelText="ยกเลิก"
                                >
                                  <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>,
                              ]}
                            >
                              <List.Item.Meta
                                title={
                                  <div className="flex items-center gap-2">
                                    <Text strong>{item?.name}</Text>
                                  </div>
                                }
                                description={
                                  <Text type="secondary">
                                    ราคา: ฿{item?.unit_price?.toLocaleString()}{" "}
                                    ต่อชิ้น
                                  </Text>
                                }
                              />
                              <div className="text-right">
                                <Text strong>
                                  ฿
                                  {(
                                    (item?.unit_price || 0) *
                                    (item?.quantity || 0)
                                  ).toLocaleString()}
                                </Text>
                              </div>

                              {/* Hidden fields */}
                              <Form.Item
                                name={[field.name, "order_item_id"]}
                                hidden
                              >
                                <InputNumber />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, "menu_item_id"]}
                                hidden
                              >
                                <InputNumber />
                              </Form.Item>
                              <Form.Item name={[field.name, "name"]} hidden>
                                <InputNumber />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, "unit_price"]}
                                hidden
                              >
                                <InputNumber />
                              </Form.Item>
                            </List.Item>
                          );
                        }}
                      />
                    ) : (
                      <Empty
                        image={
                          <ShoppingCartOutlined className="text-4xl text-gray-400" />
                        }
                        description="ไม่มีรายการในออเดอร์"
                      />
                    )}
                  </>
                )}
              </Form.List>
            </Form>
          </Card>

          {/* Deleted Items Section */}
          {deletedItems.length > 0 && (
            <Card title="รายการที่จะลบ" size="small">
              <List
                dataSource={deletedItems}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="restore"
                        size="small"
                        onClick={() => handleRestoreItem(item.id)}
                      >
                        คืนกลับ
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text delete>{item.name}</Text>}
                      description={
                        <Text delete type="secondary">
                          ฿{item.unit_price.toLocaleString()} x {item.quantity}{" "}
                          = ฿{item.subtotal.toLocaleString()}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Summary */}
          <Row justify="end" className="pt-4 border-t">
            <Col>
              <Space direction="vertical" align="end">
                <Text>
                  จำนวนรายการ:{" "}
                  {(form.getFieldValue("items") || []).length -
                    orderItemsToDelete.length}{" "}
                  รายการ
                </Text>
                <Title level={4} className="text-green-600 mb-0">
                  ยอดรวม: ฿{calculateTotal().toLocaleString()}
                </Title>
              </Space>
            </Col>
          </Row>
        </div>
      </Spin>
    </Modal>
  );
}
