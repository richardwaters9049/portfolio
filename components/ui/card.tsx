import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
    return (
        <div className={cn("bg-white rounded-lg shadow-md", className)} {...props} />
    );
};

export const CardHeader: React.FC<CardProps> = ({ className, ...props }) => {
    return (
        <div className={cn("px-6 py-4 border-b", className)} {...props} />
    );
};

export const CardContent: React.FC<CardProps> = ({ className, ...props }) => {
    return (
        <div className={cn("px-6 py-4", className)} {...props} />
    );
};

export const CardTitle: React.FC<CardProps> = ({ className, ...props }) => {
    return (
        <h2 className={cn("text-xl font-bold", className)} {...props} />
    );
};
