import { Home, Settings, ShoppingCart, List, Plus } from "lucide-react";

export const menuItems = [
    {
        label: "Dashboard",
        href: "/portal",
        icon: Home,
    },
    {
        label: "Products",
        icon: ShoppingCart,
        subMenu: [
            {
                label: "All Products",
                href: "/portal/products",
                icon: List,
            },
            {
                label: "Add Product",
                href: "/portal/products/add",
                icon: Plus,
            },
        ]
    },
    {
        label: "Settings",
        href: "/portal/settings",
        icon: Settings,
    },
]; 