"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { OfficerWorkspace } from '@/components/officer-workspace';
import { getDocuments, getProjects, uploadDocument } from '@/lib/api';
import type { MockProject } from '@/contracts/project-full';
import type { ProjectDocument, UploadDocumentInput } from '@/contracts/workflows';
import { PageHeader, Panel, Button, StatusBadge, EmptyState } from '@/components/ui';
import { getStoredDemoRole, type DemoRole } from '@/lib/demo-role';

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('projectId') ?? 'all';
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    category: 'Engineering',
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [role, setRole] = useState<DemoRole>('Applicant');
    // DigiLocker integration (UI placeholders – wire to real API when available)
  type DigiLockerDoc = {
    id: string;
    name: string;
    type: string;
    issuedBy: string;
    issuedOn: string;
  };

  type DocumentWithSource = ProjectDocument & { source?: "digilocker" | "manual" };

  const [digilockerConnected, setDigilockerConnected] = useState(false);
  const [digilockerLastSync, setDigilockerLastSync] = useState<string | null>(null);
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [digilockerDocs, setDigilockerDocs] = useState<DigiLockerDoc[]>([]);
  const [selectedDigiLockerIds, setSelectedDigiLockerIds] = useState<string[]>([]);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [digilockerError, setDigilockerError] = useState<string | null>(null);
  const [digilockerImportSuccess, setDigilockerImportSuccess] = useState<string | null>(null);
  const [linkProjectId, setLinkProjectId] = useState("");
  const [linkTaskNote, setLinkTaskNote] = useState("");

  // Enrich loaded docs with a default source label for UI
  const documentsWithSource: DocumentWithSource[] = documents.map((doc) => ({
    ...doc,
    source: (doc as DocumentWithSource).source ?? "manual"
  }));

  useEffect(() => setRole(getStoredDemoRole()), []);
    const handleConnectDigiLocker = () => {
    // Placeholder: replace with real DigiLocker OAuth / consent flow
    setDigilockerConnected(true);
    setDigilockerLastSync(new Date().toISOString());
  };

  const handleDisconnectDigiLocker = () => {
    // Placeholder: replace with real session revoke
    setDigilockerConnected(false);
    setDigilockerLastSync(null);
    setDigilockerDocs([]);
    setSelectedDigiLockerIds([]);
  };

  const handleFetchDigiLockerDocs = async () => {
    setIsDigiLockerModalOpen(true);
    setDigilockerError(null);
    setDigilockerImportSuccess(null);
    setSelectedDigiLockerIds([]);
    setLinkProjectId(uploadProject?.id ?? "");
    setLinkTaskNote("");
    setDigilockerLoading(true);

    try {
      // Placeholder: replace with real DigiLocker list API call
      await new Promise((r) => setTimeout(r, 600));
      const mockDocs: DigiLockerDoc[] = [
        { id: "dl-1", name: "Aadhaar e-KYC.pdf", type: "Identity", issuedBy: "UIDAI", issuedOn: "2025-11-12" },
        { id: "dl-2", name: "PAN Card.pdf", type: "Identity", issuedBy: "Income Tax Dept", issuedOn: "2024-03-08" },
        { id: "dl-3", name: "GST Registration Certificate.pdf", type: "Business", issuedBy: "GSTN", issuedOn: "2025-06-21" },
        { id: "dl-4", name: "Udyam Registration.pdf", type: "Business", issuedBy: "MSME", issuedOn: "2025-09-02" },
        { id: "dl-5", name: "Factory Licence (State).pdf", type: "Compliance", issuedBy: "Labour Dept", issuedOn: "2025-01-18" }
      ];
      setDigilockerDocs(mockDocs);
      setDigilockerLastSync(new Date().toISOString());
    } catch {
      setDigilockerError("Unable to fetch DigiLocker documents. Please try again later.");
      setDigilockerDocs([]);
    } finally {
      setDigilockerLoading(false);
    }
  };

  const toggleDigiLockerSelection = (id: string) => {
    setSelectedDigiLockerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImportSelected = async () => {
    if (selectedDigiLockerIds.length === 0) return;
    setDigilockerLoading(true);
    setDigilockerError(null);
    setDigilockerImportSuccess(null);

    try {
      // Placeholder: replace with real import API that creates ProjectDocument records
      const project = projects.find((p) => p.id === linkProjectId) ?? uploadProject;
      if (!project) throw new Error("Select a project before importing.");

      const selected = digilockerDocs.filter((d) => selectedDigiLockerIds.includes(d.id));
      for (const item of selected) {
        const input: UploadDocumentInput = {
          projectId: project.id,
          projectName: project.name,
          name: item.name,
          type: item.type,
          category: "Other",
          sizeLabel: "—",
          relatedTaskIds: [],
          description: `Imported from DigiLocker (${item.issuedBy}). Issued on ${item.issuedOn}. Import does not automatically satisfy any requirement — link and verify as needed.`
        };
        await uploadDocument(input);
      }

      await fetchDocuments();
      setDigilockerImportSuccess(
        `${selected.length} document${selected.length > 1 ? "s" : ""} imported. They are not automatically verified or linked to requirements.`
      );
      setSelectedDigiLockerIds([]);
    } catch (err) {
      console.error(err);
      setDigilockerError("Import failed. Please try again.");
    } finally {
      setDigilockerLoading(false);
    }
  };
  const selectedProject = projects.find((project) => project.id === projectFilter);
  const uploadProject = selectedProject ?? projects[0];

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [docs, projectData] = await Promise.all([
        getDocuments(projectFilter === 'all' ? undefined : projectFilter),
        getProjects()
      ]);
      setDocuments(docs);
      setProjects(projectData);
    } catch (err) {
      console.error(err);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const input: UploadDocumentInput = {
        projectId: uploadProject?.id ?? '',
        projectName: uploadProject?.name ?? '',
        name: uploadForm.name,
        category: uploadForm.category,
        type: uploadForm.type,
        sizeLabel: '2.5 MB', // mock
        relatedTaskIds: [],
        description: uploadForm.description
      };

      if (!input.projectId) throw new Error('Select a project before uploading a document.');
      
      await uploadDocument(input);
      await fetchDocuments();
      setIsUploadOpen(false);
      setUploadForm({ name: '', type: '', category: 'Engineering', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const getVerificationTone = (status: string) => {
    switch (status) {
      case 'verified': return 'positive';
      case 'pending': return 'warning';
      case 'needs_review': return 'info';
      case 'expired': return 'neutral';
      default: return 'neutral';
    }
  };
  
  const getRequirementTone = (status: string) => {
    switch (status) {
      case 'satisfied': return 'positive';
      case 'needs_review': return 'warning';
      case 'missing': return 'warning';
      default: return 'neutral';
    }
  };

  const filteredDocuments = documentsWithSource.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Engineering', 'Utilities', 'Environmental', 'Safety', 'Operations', 'Other'];
  
  if (role === 'Officer') {
    return <OfficerWorkspace mode="documents" />;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Documents"
          description={
            selectedProject
              ? `Documents for ${selectedProject.name}.`
              : "Manage and review documents across all projects."
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={digilockerConnected ? handleFetchDigiLockerDocs : handleConnectDigiLocker}
              >
                {digilockerConnected ? "Import from DigiLocker" : "Connect DigiLocker"}
              </Button>
              <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                Upload from device
              </Button>
            </div>
          }
        />
                {/* DigiLocker connection panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-[#172b3a]">DigiLocker</h2>
                <StatusBadge tone={digilockerConnected ? "positive" : "neutral"}>
                  {digilockerConnected ? "Connected" : "Not connected"}
                </StatusBadge>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
                {digilockerConnected
                  ? "Retrieve issued documents from your DigiLocker account into IndusAI. Imported files still need to be linked to project requirements and verified — import alone does not satisfy any approval."
                  : "Connect DigiLocker to securely fetch issued certificates and identity documents. You can still upload files manually for anything not available in DigiLocker."}
              </p>
              {digilockerConnected && digilockerLastSync ? (
                <p className="mt-1 text-xs text-slate-500">
                  Last sync: {new Date(digilockerLastSync).toLocaleString("en-IN")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              {digilockerConnected ? (
                <>
                  <Button variant="primary" onClick={handleFetchDigiLockerDocs}>
                    Fetch documents
                  </Button>
                  <Button variant="secondary" onClick={handleDisconnectDigiLocker}>
                    Manage connection
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={handleConnectDigiLocker}>
                  Connect DigiLocker
                </Button>
              )}
            </div>
          </div>
        </div>

        <Panel>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={projectFilter}
                onChange={(e) => router.push(e.target.value === 'all' ? '/documents' : `/documents?projectId=${encodeURIComponent(e.target.value)}`)}
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                aria-label="Filter documents by project"
              >
                <option value="all">All projects</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-[#f8fafc] h-32 w-full"></div>
              ))}
            </div>
          ) : error ? (
            <EmptyState 
              title="Error loading documents" 
              description={error} 
              action={<Button onClick={fetchDocuments}>Retry</Button>}
            />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState 
              title="No documents found" 
              description="Upload a new document or adjust your search filters."
              action={
                <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                  Upload document
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 flex flex-col gap-4">
                  <div 
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#172b3a]">{doc.name}</span>
                        <StatusBadge tone="neutral">{doc.type}</StatusBadge>
                        <StatusBadge tone="info">{doc.category}</StatusBadge>
                        <StatusBadge tone={doc.source === "digilocker" ? "info" : "neutral"}>
                          {doc.source === "digilocker" ? "DigiLocker" : "Manual upload"}
                        </StatusBadge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Project: {doc.projectName}</span>
                        <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        <span>Size: {doc.sizeLabel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge tone={getVerificationTone(doc.verificationStatus)}>
                        Verification: {doc.verificationStatus.replace('_', ' ')}
                      </StatusBadge>
                      {doc.requirementStatus && (
                        <StatusBadge tone={getRequirementTone(doc.requirementStatus)}>
                          Req: {doc.requirementStatus.replace('_', ' ')}
                        </StatusBadge>
                      )}
                    </div>
                  </div>

                  {expandedDocId === doc.id && (
                    <div className="mt-2 pt-4 border-t border-slate-200 text-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Details</h4>
                        <div className="space-y-2 text-slate-600">
                          <p><span className="font-medium">Description:</span> {doc.description || 'No description provided.'}</p>
                          <p><span className="font-medium">Document ID:</span> {doc.id}</p>
                          {doc.expiryAt && <p><span className="font-medium">Expiry:</span> {new Date(doc.expiryAt).toLocaleDateString()}</p>}
                          <p><span className="font-medium">Source Verification:</span> {doc.sourceVerificationStatus?.replace('_', ' ') || 'Unknown'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Related Tasks</h4>
                        {doc.relatedTaskIds && doc.relatedTaskIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {doc.relatedTaskIds.map(taskId => (
                              <StatusBadge key={taskId} tone="neutral">{taskId}</StatusBadge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No related tasks</p>
                        )}
                        <div className="mt-4 flex gap-2">
                           <Button variant="secondary">View full document</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#172b3a] mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. site-plan-v2.pdf"
                  value={uploadForm.name}
                  onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. PDF, CAD"
                    value={uploadForm.type}
                    onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <input
                  type="text"
                  readOnly
                  value={uploadProject?.name ?? 'Select a project'}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Optional details about this document..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isUploading || !uploadForm.name || !uploadForm.type}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
            {isDigiLockerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-[#172b3a]">Import from DigiLocker</h2>
              <p className="mt-1 text-sm text-slate-600">
                Select documents to import. Importing does <strong>not</strong> automatically
                satisfy or approve any project requirement — you can link them afterwards and
                reuse one document across multiple requirements.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {digilockerLoading && digilockerDocs.length === 0 ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : digilockerError && digilockerDocs.length === 0 ? (
                <EmptyState
                  title="Could not load DigiLocker documents"
                  description={digilockerError}
                  action={
                    <Button variant="secondary" onClick={handleFetchDigiLockerDocs}>
                      Retry
                    </Button>
                  }
                />
              ) : digilockerDocs.length === 0 ? (
                <EmptyState
                  title="No documents available"
                  description="No issued documents were returned from DigiLocker for this account."
                />
              ) : (
                <div className="space-y-2">
                  {digilockerDocs.map((item) => {
                    const checked = selectedDigiLockerIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                          checked
                            ? "border-[#27628a] bg-[#eef8ff]"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#27628a] focus:ring-[#27628a]"
                          checked={checked}
                          onChange={() => toggleDigiLockerSelection(item.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#172b3a]">{item.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.type} · Issued by {item.issuedBy} ·{" "}
                            {new Date(item.issuedOn).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {digilockerDocs.length > 0 && (
                <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Link to project
                    </label>
                    <select
                      value={linkProjectId}
                      onChange={(e) => setLinkProjectId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Optional note for requirements (not auto-linked)
                    </label>
                    <input
                      type="text"
                      value={linkTaskNote}
                      onChange={(e) => setLinkTaskNote(e.target.value)}
                      placeholder="e.g. Candidate for fire safety / site plan requirement"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      One imported document can later be associated with multiple requirements.
                      Verification status remains separate from requirement status.
                    </p>
                  </div>
                </div>
              )}

              {digilockerImportSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {digilockerImportSuccess}
                </div>
              )}
              {digilockerError && digilockerDocs.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {digilockerError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-500">
                {selectedDigiLockerIds.length} selected
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsDigiLockerModalOpen(false);
                    setDigilockerImportSuccess(null);
                    setDigilockerError(null);
                  }}
                  disabled={digilockerLoading}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleImportSelected}
                  disabled={
                    digilockerLoading ||
                    selectedDigiLockerIds.length === 0 ||
                    !linkProjectId
                  }
                >
                  {digilockerLoading ? "Importing…" : "Import selected"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
