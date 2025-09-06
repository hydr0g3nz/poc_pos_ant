// สร้างไฟล์ src/components/admin/EditOrderModal.tsx

"use client";

import {
  Modal,
  Form,
  Select,
  InputNumber,
  Button,
  Space,
  List,
  Typography,
  Divider,
  Card,
  Row,
  Col,
  Tag,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import {
  EditOrderItem,
  MenuItem,
  MenuItemOption,
  SelectedOrderOption,
  OrderDetailResponse,
} from "@/types";
import Link from "next/link";
const { Title, Text } = Typography;
const { Option } = Select;

interface EditOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  order: OrderDetailResponse | null;
}

export default function EditOrderModal({
  open,
  onCancel,
  onSave,
  order,
}: EditOrderModalProps) {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<EditOrderItem[]>([]);
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && order) {
      loadData();
    }
  }, [open, order]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuItemsResponse] = await Promise.all([
        adminService.getMenuItemsForOrder(),
      ]);

      setAvailableMenuItems(menuItemsResponse.data.items || []);

      // Convert existing order items to editable format
      const editableItems: EditOrderItem[] = (order.items || []).map(
        (item: any) => ({
          id: item.id,
          menu_item_id: item.item_id,
          name: item.menu_item?.name || item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          options: [], // TODO: Load existing options
          isNew: false,
          isModified: false,
        })
      );

      setOrderItems(editableItems);
    } catch (error) {
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const addNewItem = (values: any) => {
    const selectedMenuItem = availableMenuItems.find(
      (item) => item.id === values.menu_item_id
    );
    if (!selectedMenuItem) return;

    const newItem: EditOrderItem = {
      menu_item_id: values.menu_item_id,
      name: selectedMenuItem.name,
      quantity: values.quantity,
      unit_price: selectedMenuItem.price,
      subtotal: selectedMenuItem.price * values.quantity,
      options: [],
      isNew: true,
    };

    setOrderItems((prev) => [...prev, newItem]);
    form.resetFields();
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newSubtotal = item.unit_price * newQuantity;
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newSubtotal,
            isModified: !item.isNew,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (index: number) => {
    setOrderItems((prev) => {
      const item = prev[index];
      if (item.isNew) {
        // Remove new items completely
        return prev.filter((_, i) => i !== index);
      } else {
        // Mark existing items for deletion
        return prev.map((item, i) =>
          i === index ? { ...item, toDelete: true } : item
        );
      }
    });
  };

  const restoreItem = (index: number) => {
    setOrderItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, toDelete: false } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const itemsToManage = orderItems
        .filter((item) => !item.toDelete)
        .map((item) => ({
          order_item_id: item.isNew ? undefined : item.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          options:
            item.options?.map((opt) => ({
              option_id: opt.option_id,
              option_val_id: opt.value_id,
            })) || [],
          action: item.isNew ? "add" : item.isModified ? "update" : undefined,
        }));

      // Add items marked for deletion
      const itemsToDelete = orderItems
        .filter((item) => item.toDelete && !item.isNew)
        .map((item) => ({
          order_item_id: item.id,
          menu_item_id: item.menu_item_id,
          quantity: 0, // Quantity 0 means delete
          action: "delete" as const,
        }));

      const allItems = [...itemsToManage, ...itemsToDelete];

      if (allItems.length > 0) {
        await adminService.manageOrderItems({
          order_id: order.id,
          items: allItems,
        });
      }

      message.success("อัพเดทออเดอร์สำเร็จ");
      onSave();
    } catch (error: any) {
      message.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    return orderItems
      .filter((item) => !item.toDelete)
      .reduce((total, item) => total + item.subtotal, 0);
  };

  const activeItems = orderItems.filter((item) => !item.toDelete);
  const deletedItems = orderItems.filter((item) => item.toDelete);

  return (
    <Modal
      title={`แก้ไขออเดอร์ #${order?.id} - โต๊ะ ${order?.table_id}`}
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
          disabled={orderItems.length === 0}
        >
          บันทึกการเปลี่ยนแปลง
        </Button>,
      ]}
      width={900}
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        <div className="space-y-4">
          {/* Add New Item Form */}
          <Card title="เพิ่มรายการใหม่" size="small">
            <Link href={`/customer/${order?.uuid}/menu`}>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                เพิ่ม
              </Button>
            </Link>
          </Card>

          {/* Current Order Items */}
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
            {activeItems.length > 0 ? (
              <List
                dataSource={activeItems}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="decrease"
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      />,
                      <InputNumber
                        key="quantity"
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(index, value || 1)}
                        style={{ width: 70 }}
                      />,
                      <Button
                        key="increase"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="ลบรายการ"
                        description="คุณแน่ใจหรือไม่ที่จะลบรายการนี้?"
                        onConfirm={() => removeItem(index)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center gap-2">
                          {item.name}
                          {item.isNew && <Tag color="green">ใหม่</Tag>}
                          {item.isModified && <Tag color="orange">แก้ไข</Tag>}
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">
                            ฿{item.unit_price.toLocaleString()} x{" "}
                            {item.quantity}
                          </Text>
                          {item.options && item.options.length > 0 && (
                            <div className="mt-1">
                              {item.options.map((option, i) => (
                                <Tag key={i}>
                                  {option.option_name}: {option.value_name}
                                  {option.additional_price > 0 &&
                                    ` (+฿${option.additional_price})`}
                                </Tag>
                              ))}
                            </div>
                          )}
                        </div>
                      }
                    />
                    <div className="text-right">
                      <Text strong>฿{item.subtotal.toLocaleString()}</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCartOutlined className="text-4xl mb-2" />
                <div>ไม่มีรายการในออเดอร์</div>
              </div>
            )}
          </Card>

          {/* Deleted Items */}
          {deletedItems.length > 0 && (
            <Card title="รายการที่จะลบ" size="small">
              <List
                dataSource={deletedItems}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="restore"
                        size="small"
                        onClick={() => restoreItem(orderItems.indexOf(item))}
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
          <Divider />
          <Row justify="end">
            <Col>
              <Space direction="vertical" align="end">
                <Text>จำนวนรายการ: {activeItems.length} รายการ</Text>
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
