'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/zustand/auth";

const Page = () => {
    const router = useRouter();
    const authStore = useAuthStore();
    useEffect(() => {
        authStore.signOut();
        router.push('/', { scroll: true })
    }, []);

    return (
        <div className="content"/>
    );
}

export default Page;
