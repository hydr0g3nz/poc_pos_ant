"use client";
import type { MenuProps } from "antd";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Space,
} from "antd";
import {
  DashboardOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "";

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "แดชบอร์ด",
    },
    {
      key: "/admin/menus",
      icon: <MenuOutlined />,
      label: "จัดการเมนู",
      children: [
        {
          key: "/admin/menu",
          label: "รายการเมนู",
        },
        {
          key: "/admin/categories",
          label: "หมวดหมู่",
        },
        {
          key: "/admin/kitchen-stations",
          label: "สถานีครัว",
        },
      ],
    },
    {
      key: "/admin/orders",
      icon: <ShoppingCartOutlined />,
      label: "จัดการออเดอร์",
    },
    {
      key: "/admin/tables",
      icon: <TableOutlined />,
      label: "จัดการโต๊ะ",
    },
    {
      key: "/admin/kitchen",
      icon: <SettingOutlined />,
      label: "ครัว",
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "โปรไฟล์",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "ตั้งค่า",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="shadow-lg"
        theme="light"
      >
        <div className="p-4 text-center border-b">
          <Link href="/admin" className="text-xl font-bold text-orange-600">
            {collapsed ? "POS" : "POS System"}
          </Link>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems.map((item) => ({
            ...item,
            onClick: item.children ? undefined : () => router.push(item.key),
            children: item.children?.map((child) => ({
              ...child,
              onClick: () => router.push(child.key),
            })),
          }))}
          className="border-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex justify-between items-center">
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => router.push("/")}
            >
              กลับหน้าหลัก
            </Button>
          </Space>

          <Space>
            <Button type="text" icon={<BellOutlined />} />
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === "logout") {
                    router.push("/");
                  }
                },
              }}
              placement="bottomRight"
            >
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text>ผู้ดูแลระบบ</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="bg-gray-50 p-6">{children}</Content>
      </Layout>
    </Layout>
  );
}
