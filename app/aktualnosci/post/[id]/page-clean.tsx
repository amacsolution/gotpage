"use client"

import dynamic from "next/dynamic";

// Ładujemy klientowy komponent dynamicznie z wyłączeniem SSR
const StronaPojedynczegoWpisu = dynamic(() => import("./post-client"), {
    ssr: false,
});

export default function PostWrapper({ id }: { id: string }) {
    return <StronaPojedynczegoWpisu id={id} />;
}
