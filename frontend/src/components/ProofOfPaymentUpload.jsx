import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Hash,
  X
} from 'lucide-react';

export const ProofOfPaymentUpload = ({ 
  proof, 
  onProofChange, 
  txHash = '', 
  onTxHashChange, 
  label = 'Upload Proof of Payment',
  sublabel = 'Attach a screenshot of your cryptocurrency transfer, wallet receipt, or PDF'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleProcessFile = (file) => {
    setFileError('');
    if (!file) return;

    // Allowed types: images & PDF
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a PNG, JPG, WEBP image or PDF document.');
      return;
    }

    // Max 12MB file size
    if (file.size > 12 * 1024 * 1024) {
      setFileError('File size exceeds 12MB limit. Please upload a smaller image or compressed receipt.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onProofChange({
        fileName: file.name,
        fileType: file.type,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        fileData: reader.result,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.onerror = () => {
      setFileError('Failed to read file. Please try selecting the file again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onProofChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3.5 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <UploadCloud size={15} className="text-emerald-400" />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-neutral-400 mt-0.5">{sublabel}</p>
        </div>
        {proof && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> Attached
          </span>
        )}
      </div>

      {fileError && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Box / Dropzone */}
      {!proof ? (
        <div
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-white/15 bg-[#121217] hover:border-white/30 hover:bg-[#16161e]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
              <UploadCloud size={20} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white">
                Click to browse receipt
              </span>
              <span className="text-xs text-neutral-400"> or drag and drop</span>
            </div>
            <p className="text-[10px] text-neutral-500">
              PNG, JPG, WEBP, or PDF (Max 12MB)
            </p>
          </div>
        </div>
      ) : (
        /* File Uploaded Preview Card */
        <div className="p-3.5 bg-[#101015] border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Thumbnail / Icon */}
            {proof.fileType?.startsWith('image/') ? (
              <div 
                onClick={() => setIsPreviewModalOpen(true)}
                className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 cursor-pointer relative group"
                title="Click to preview image"
              >
                <img
                  src={proof.fileData}
                  alt={proof.fileName}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Eye size={14} />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <FileText size={22} />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[280px]">
                  {proof.fileName}
                </p>
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              </div>
              <p className="text-[10px] text-neutral-400">
                {proof.fileSize} · {proof.fileType?.startsWith('image/') ? 'Image Receipt' : 'PDF Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {proof.fileType?.startsWith('image/') && (
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-xs transition-colors"
                title="Preview receipt"
              >
                <Eye size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors"
              title="Remove proof"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Transaction Hash Input */}
      {onTxHashChange && (
        <div className="pt-1">
          <label className="block text-[11px] text-neutral-400 mb-1 font-medium flex items-center gap-1">
            <Hash size={12} className="text-amber-400" />
            <span>Transaction Hash / Reference (TxID) (Optional)</span>
          </label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => onTxHashChange(e.target.value)}
            placeholder="e.g. 0x8f2a4b... or btc txid hash"
            className="w-full px-3.5 py-2 bg-[#141419] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-tesla-red"
          />
        </div>
      )}

      {/* Full Preview Modal for Image Receipt */}
      {isPreviewModalOpen && proof?.fileData && (
        <div 
          onClick={() => setIsPreviewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#121217] border border-white/15 rounded-2xl p-5 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-[320px]">
                  {proof.fileName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-xl border border-white/10 bg-black/40 flex items-center justify-center p-2">
              <img
                src={proof.fileData}
                alt={proof.fileName}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-neutral-400 pt-1">
              <span>{proof.fileSize}</span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="btn-tesla-secondary text-xs px-4 py-1.5 text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
