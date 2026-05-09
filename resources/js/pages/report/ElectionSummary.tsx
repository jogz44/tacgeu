import { Head, usePage, useForm } from '@inertiajs/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Toaster } from 'sonner';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Users, UserCheck, Trophy, FileDown, Check, X, FileText } from "lucide-react";
import ExportElectionReportPDF from './pdf/ExportElectionReportPDF';
import ExportElectionTurnOutPDF from './pdf/ExportElectionTurnOutPDF';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Electoral Report', href: '/election-summary' },
];

export default function ElectionSummary() {
  const { elections = [], summary: rawSummary, selected_election } = usePage().props as any;

  const summary = rawSummary || {
    total_voters: 0,
    total_votes: 0,
    turnout_rate: 0,
    total_candidates: 0,
    candidates: [],
  };
  const { data, setData, get } = useForm({
    election_id: selected_election?.id,
  });

  const stats = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      label: "Registered Voters",
      value: summary.total_voters || 0,
      accent: "border-blue-500 bg-gradient-to-tr from-blue-20 to-blue-50",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-green-600" />,
      label: "Votes Cast",
      value: summary.total_votes || 0,
      accent: "border-green-500 bg-gradient-to-tr from-green-20 to-green-50",
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-600" />,
      label: "Turnout Rate",
      value: `${summary.turnout_rate || 0}%`,
      accent: "border-yellow-500 bg-gradient-to-tr from-yellow-20 to-yellow-50",
    },
    {
      icon: <FileDown className="h-8 w-8 text-purple-600" />,
      label: "Total Candidates",
      value: summary.total_candidates || 0,
      accent: "border-purple-500 bg-gradient-to-tr from-purple-20 to-purple-50",
    },
  ];

  const handleFilter = () => {
    if (data.election_id) {
      get(route("election.summary", { election_id: data.election_id }), {
        preserveScroll: true,
        preserveState: true,
      });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Electoral Report" />
        <div className="flex h-full flex-col gap-4 rounded-xl p-4">
          <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border py-6">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
            <div className="relative z-10 space-y-4 px-4">
              <Heading
                title="Electoral Performance Report"
                description="Analyze voter turnout, candidate performance, and election outcomes within the selected election period."
              />

              {/* Election Filter */}
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Election</label>
                    <Select
                      value={data.election_id}
                      onValueChange={(val) => setData("election_id", val)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select election" />
                      </SelectTrigger>
                      <SelectContent>
                        {elections.map((el: any) => (
                          <SelectItem key={el.id} value={String(el.id)}>
                            {el.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="default" onClick={handleFilter} disabled={!data.election_id}>
                    Filter
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  {summary && summary.election && (
                    <ExportElectionReportPDF summary={summary} />
                  )}
                </div>
              </div>


              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {stats.map((item, i) => (
                    <Card
                      key={i}
                      className={`relative overflow-hidden rounded-2xl border-l-8 ${item.accent} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                    >
                      {/* Background accent pattern */}
                      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[100%] bg-white/40 blur-xl opacity-50"></div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-inner">
                          {item.icon}
                        </div>

                        <div className="text-center mt-2">
                          <p className="text-sm font-medium text-gray-600">{item.label}</p>
                          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Remarks */}
              {selected_election && selected_election.remarks && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md shadow-sm flex items-start gap-2">
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-red-800 italic">
                    Remarks: {selected_election.remarks}
                  </p>
                </div>
              )}

              {/* Candidate Results Section */}
              {summary?.candidates && summary.candidates.length > 0 ? (
                <section className="mt-10">
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full mb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold mb-4">Candidate Results</h2>
                    </div>
                    <div className="flex justify-end gap-2">
                      <ExportElectionTurnOutPDF summary={summary} />
                    </div>
                  </div>

                  {/* Grouped Table */}
                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                    <Table>
                      <TableHeader className="bg-gray-100 dark:bg-gray-800">
                        <TableRow>
                          <TableHead className="w-[30%]">Candidate</TableHead>
                          <TableHead className="text-right w-[15%]">Total Votes</TableHead>
                          <TableHead className="text-center w-[10%]">Percentage</TableHead>
                          <TableHead className="text-center w-[10%]">Performance</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {Object.entries(
                          summary.candidates.reduce((groups: any, candidate: any) => {
                            const pos = candidate.position || "Unknown Position";
                            if (!groups[pos]) groups[pos] = [];
                            groups[pos].push(candidate);
                            return groups;
                          }, {})
                        ).map(([position, candidates]: any, posIndex: number) => (
                          <React.Fragment key={posIndex}>
                            {/* Position Header Row */}
                            <TableRow className="bg-green-200 dark:bg-green-800/50">
                              <TableCell colSpan={4} className="font-bold text-gray-900 dark:text-gray-100 py-3">
                                {position}
                              </TableCell>
                            </TableRow>

                            {/* Candidate Rows */}
                            {candidates
                              .sort((a: any, b: any) => b.votes - a.votes)
                              .map((candidate: any, index: number) => (
                                <TableRow
                                  key={index}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-4 p-2">
                                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {candidate.candidate}
                                      </h3>
                                    </div>
                                  </TableCell>
                                  {/* <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                                    {candidate.position}
                                  </TableCell> */}
                                  <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">
                                    {candidate.votes.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-center font-semibold text-gray-800 dark:text-gray-200">
                                    {candidate.percentage.toFixed(2)}%
                                  </TableCell>
                                  <TableCell className="flex justify-center items-center">
                                    {candidate.result === "Win" ? (
                                      <Check className="w-6 h-6 p-1 rounded-full text-white bg-green-500" />
                                    ) : (
                                      <X className="w-6 h-6 p-1 rounded-full text-white bg-red-500" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              ) : (
                <div className="mt-10 text-center text-gray-500 dark:text-gray-400 italic border border-gray-200 dark:border-gray-700 rounded-xl py-6 bg-white dark:bg-gray-900 shadow-sm">
                  No candidate data to display.
                </div>)}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
