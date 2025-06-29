// app/components/CategoryGrid.tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type CategoriesProps = {
    categories: {
        name: string;
        icon: ReactNode;
        href: string;
        color: string;
        textColor: string;
    }[]
};

export default function CategoryGrid({ categories }: CategoriesProps) {
    return (
        <div
            className="grid grid-cols-9 grid-rows-2 md:mx-auto align-top ml-2"
            style={{ width: "1200px", minWidth: "1200px" }}
        >
            {categories.map((category, index) => (
                <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <Link
                        href={category.href}
                        className="flex flex-col items-center p-4 rounded-lg transition-all hover:scale-105 hover:-translate-y-2 w-28"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <meta itemProp="position" content={`${index + 1}`} />
                        <div
                            className={`p-4 rounded-full ${category.color} ${category.textColor} mb-2`}
                        >
                            {category.icon}
                        </div>
                        <span className="text-sm font-medium text-center" itemProp="name">
                            {category.name}
                        </span>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
