"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

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

import { Search, ArrowLeft, ArrowRight, Download } from "lucide-react";
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

/* ---------------- HELPER ---------------- */
function classifyWebsite(url: string): "ok" | "manual" {
  try {
    const host = new URL(url).hostname.replace("www.", "").toLowerCase();

    if (host.includes("weedmaps.com") || host.includes("leafly.com")) {
      return "manual";
    }

    return "ok";
  } catch {
    return "manual";
  }
}

/* ---------------- PAGE ---------------- */
export default function Page() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / Number(limit)));

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

  /* ---------------- EXPORT EXCEL (NO page_url) ---------------- */
  const exportToExcel = async () => {
    // confirm
    const confirmDelete = confirm(
      "Export ALL leads and DELETE them permanently?",
    );
    if (!confirmDelete) return;

    // ✅ fetch ALL leads (not just current page)
    const res = await fetch(`/api/leads?limit=all`);
    const data: ApiResponse = await res.json();

    if (!data.data.length) return;

    const exportData = data.data.map((lead) => ({
      Store: lead.store_name,
      Email: lead.email,
      Website: lead.website,
      Type:
        classifyWebsite(lead.website) === "manual"
          ? "Manual Search Required"
          : "Valid",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    // ✅ export everything
    XLSX.writeFile(workbook, "leads-export.xlsx");

    // ✅ delete everything AFTER export
    await fetch("/api/leads", {
      method: "DELETE",
    });

    // refresh UI
    setLeads([]);
    setTotal(0);
  };
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
      <div className="flex flex-col md:flex-row gap-3 items-center">
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

        <Select value={limit} onValueChange={(v) => v && setLimit(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        {/* EXPORT BUTTON */}
        <Button onClick={exportToExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
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
                  <TableCell>
                    {classifyWebsite(lead.website) === "manual" ? (
                      <span className="text-muted-foreground italic">
                        Manual search required
                      </span>
                    ) : (
                      <a
                        href={lead.website}
                        target="_blank"
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
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Prev
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>

        <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
