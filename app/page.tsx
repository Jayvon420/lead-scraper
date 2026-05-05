// "use client";

// import { useEffect, useState } from "react";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ThemeToggle } from "@/components/theme-toggle";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Search, ArrowLeft, ArrowRight } from "lucide-react";

// /* ---------------- TYPES ---------------- */
// type Lead = {
//   store_name: string;
//   website: string;
//   email: string;
//   page_url: string;
// };

// type ApiResponse = {
//   data: Lead[];
//   total: number;
// };

// /* ---------------- PAGE ---------------- */
// export default function Page() {
//   const [search, setSearch] = useState<string>("");
//   const [page, setPage] = useState<number>(1);
//   const [limit, setLimit] = useState<string>("10");

//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [total, setTotal] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);

//   const numericLimit = limit === "all" ? 999999 : Number(limit);
//   const totalPages = Math.max(1, Math.ceil(total / numericLimit));

//   /* ---------------- FETCH DATA ---------------- */
//   async function fetchLeads() {
//     setLoading(true);

//     const res = await fetch(
//       `/api/leads?search=${search}&page=${page}&limit=${limit}`,
//     );

//     const data: ApiResponse = await res.json();

//     setLeads(data.data);
//     setTotal(data.total);

//     setLoading(false);
//   }

//   useEffect(() => {
//     fetchLeads();
//   }, [search, page, limit]);

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-semibold">Leads Dashboard</h1>
//           <p className="text-sm text-muted-foreground">
//             Scraped data from your extension
//           </p>
//         </div>

//         <ThemeToggle />
//       </div>

//       {/* CONTROLS */}
//       <div className="flex flex-col md:flex-row gap-3">
//         {/* SEARCH */}
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             className="pl-9"
//             placeholder="Search store or email..."
//             value={search}
//             onChange={(e) => {
//               setPage(1);
//               setSearch(e.target.value);
//             }}
//           />
//         </div>

//         {/* LIMIT SELECT (FIXED TYPE SAFE) */}
//         <Select
//           value={limit}
//           onValueChange={(value) => {
//             // ✅ SAFE TYPE GUARD
//             if (!value) return;

//             setLimit(value);
//             setPage(1);
//           }}
//         >
//           <SelectTrigger className="w-[140px]">
//             <SelectValue placeholder="Rows" />
//           </SelectTrigger>

//           <SelectContent>
//             <SelectItem value="10">10</SelectItem>
//             <SelectItem value="20">20</SelectItem>
//             <SelectItem value="50">50</SelectItem>
//             <SelectItem value="100">100</SelectItem>
//             <SelectItem value="all">All</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* TABLE */}
//       <div className="border rounded-lg overflow-hidden">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Store</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>Website</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={3} className="text-center py-10">
//                   Loading...
//                 </TableCell>
//               </TableRow>
//             ) : leads.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={3} className="text-center py-10">
//                   No results found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               leads.map((lead, i) => (
//                 <TableRow key={i}>
//                   <TableCell>{lead.store_name}</TableCell>
//                   <TableCell>{lead.email}</TableCell>
//                   <TableCell className="text-blue-500">
//                     {lead.website}
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* PAGINATION */}
//       <div className="flex items-center justify-center gap-4">
//         <Button
//           variant="outline"
//           disabled={page <= 1}
//           onClick={() => setPage((p) => Math.max(1, p - 1))}
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Prev
//         </Button>

//         <span className="text-sm text-muted-foreground">
//           Page {page} / {totalPages}
//         </span>

//         <Button
//           variant="outline"
//           disabled={page >= totalPages}
//           onClick={() => setPage((p) => p + 1)}
//         >
//           Next
//           <ArrowRight className="h-4 w-4 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

/* ---------------- TYPES ---------------- */
type Lead = {
  store_name: string;
  website: string;
  email: string;
  page_url: string;
};

type ApiResponse = {
  data: Lead[];
  total: number;
};

/* ---------------- HELPER (WEEDMAPS FIX) ---------------- */
function classifyWebsite(url: string): "ok" | "manual" {
  try {
    const host = new URL(url).hostname.replace("www.", "").toLowerCase();

    if (host === "weedmaps.com" || host === "leafly.com") {
      return "manual";
    }

    return "ok";
  } catch {
    return "manual";
  }
}

/* ---------------- PAGE ---------------- */
export default function Page() {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<string>("10");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const numericLimit = limit === "all" ? 999999 : Number(limit);
  const totalPages = Math.max(1, Math.ceil(total / numericLimit));

  /* ---------------- FETCH ---------------- */
  async function fetchLeads() {
    setLoading(true);

    const res = await fetch(
      `/api/leads?search=${search}&page=${page}&limit=${limit}`,
    );

    const data: ApiResponse = await res.json();

    setLeads(data.data);
    setTotal(data.total);

    setLoading(false);
  }

  useEffect(() => {
    fetchLeads();
  }, [search, page, limit]);

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Leads Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Scraped data from your extension
          </p>
        </div>
        <ThemeToggle />
      </div>
      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search store or email..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {/* LIMIT */}
        <Select
          value={limit}
          onValueChange={(value) => {
            if (!value) return;
            setLimit(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Website</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead, i) => (
                <TableRow key={i}>
                  <TableCell>{lead.store_name}</TableCell>

                  <TableCell>{lead.email}</TableCell>

                  {/* ✅ FIXED WEEDMAPS LOGIC HERE */}
                  <TableCell>
                    {classifyWebsite(lead.website) === "manual" ? (
                      <span className="text-muted-foreground italic">
                        Manual search required
                      </span>
                    ) : (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {lead.website}
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Prev
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
