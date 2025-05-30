import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  File,
  FileText,
  Plus,
  Edit,
  Download,
  Trash2,
  Search,
  FileCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Navbar from "../components/layout/Navbar";
import { mockResumes } from "../utils/mockData";
import { toast } from "sonner";
import { Resume } from "../types";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Resume[]>(mockResumes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "resume" | "coverLetter">("all");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Get authentication status

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    toast.success("Document deleted successfully");
  };

  const handleDownloadPDF = (doc: Resume) => {
    toast.success(`Downloaded ${doc.title} as PDF`);
  };

  const handleDownloadDOCX = (doc: Resume) => {
    toast.success(`Downloaded ${doc.title} as DOCX`);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || doc.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="mt-1 text-gray-500">
              Manage your resumes and cover letters in one place.
            </p>
          </div>
          {isAuthenticated && ( // Only show these buttons if authenticated
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <Link to="/create-resume">
                <Button icon={<FileText className="h-4 w-4" />}>
                  Create Resume
                </Button>
              </Link>
              <Link to="/create-cover-letter">
                <Button
                  variant="secondary"
                  icon={<FileCheck className="h-4 w-4" />}
                >
                  Create Cover Letter
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row mb-6 gap-4">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "primary" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "resume" ? "primary" : "outline"}
              onClick={() => setFilter("resume")}
            >
              Resumes
            </Button>
            {isAuthenticated && ( // Only show cover letter filter if authenticated
              <Button
                variant={filter === "coverLetter" ? "primary" : "outline"}
                onClick={() => setFilter("coverLetter")}
              >
                Cover Letters
              </Button>
            )}
          </div>
        </div>

        {/* Document List */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onEdit={() =>
                  navigate(
                    doc.type === "resume"
                      ? `/update-resume/${doc.id}`
                      : `/update-cover-letter/${doc.id}`
                  )
                }
                onDelete={() => handleDelete(doc.id)}
                onDownloadPDF={() => handleDownloadPDF(doc)}
                onDownloadDOCX={() => handleDownloadDOCX(doc)}
                isAuthenticated={isAuthenticated} // Pass auth status to DocumentCard
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No documents found
            </h3>
            <p className="mt-1 text-gray-500">
              {searchQuery
                ? "No documents match your search query."
                : "Get started by creating your first document."}
            </p>
            {!searchQuery &&
              isAuthenticated && ( // Only show create buttons if authenticated
                <div className="mt-6 flex justify-center gap-4">
                  <Link to="/create-resume">
                    <Button icon={<FileText className="h-4 w-4" />}>
                      Create Resume
                    </Button>
                  </Link>
                  <Link to="/create-cover-letter">
                    <Button
                      variant="secondary"
                      icon={<FileCheck className="h-4 w-4" />}
                    >
                      Create Cover Letter
                    </Button>
                  </Link>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
};

// Update DocumentCard props interface
interface DocumentCardProps {
  document: Resume;
  onEdit: () => void;
  onDelete: () => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  isAuthenticated: boolean; // Add isAuthenticated prop
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onDownloadPDF,
  onDownloadDOCX,
  isAuthenticated,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isResume = document.type === "resume";
  const content = document.content as any;

  return (
    <motion.div
      className={`bg-white shadow-sm rounded-lg border overflow-hidden hover:shadow-md transition-shadow flex flex-col ${
        isResume ? "border-primary-200" : "border-secondary-200"
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 flex-grow">
        {/* ... (rest of the card content remains the same) ... */}
      </div>

      {isAuthenticated && ( // Only show edit button if authenticated
        <div
          className={`px-6 py-4 border-t mt-auto ${
            isResume
              ? "bg-primary-50 border-primary-100"
              : "bg-secondary-50 border-secondary-100"
          }`}
        >
          <button
            onClick={onEdit}
            className={`inline-flex items-center text-sm font-medium ${
              isResume
                ? "text-primary-600 hover:text-primary-500"
                : "text-secondary-600 hover:text-secondary-500"
            }`}
          >
            <Edit className="mr-1.5 h-4 w-4" />
            Edit {isResume ? "Resume" : "Cover Letter"}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
