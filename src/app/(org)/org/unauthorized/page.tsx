import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceUnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="bg-red-500/10 border border-red-550/20 p-4 rounded-3xl mb-6">
        <ShieldAlert className="h-10 w-10 text-red-500" />
      </div>
      
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Access Denied (403)</h1>
      <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        Your member profile does not have the required permissions to access this feature of the workspace. Please request permissions upgrade from the workspace Owner.
      </p>

      <div className="flex gap-4">
        <Link href="/org">
          <Button className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
