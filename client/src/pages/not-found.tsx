import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="flex justify-center text-destructive">
          <AlertCircle size={64} />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900">404 Page Not Found</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved to another ocean.
        </p>
        <Link href="/" className="inline-block mt-4">
          <Button size="lg">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
