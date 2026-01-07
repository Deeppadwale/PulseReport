// import React from "react";
// import {
//   useGetUserListByMemberIdQuery,
//   useLazyDownloadReportFileQuery,
//   useLazyPreviewReportFileQuery,
// } from "../services/memberReportApi";

// const MemberReportTable = () => {
//   const memberId = sessionStorage.getItem("member_id");

//   const { data, isLoading, error } = useGetUserListByMemberIdQuery(memberId, {
//     skip: !memberId,
//   });

//   const [previewReport] = useLazyPreviewReportFileQuery();
//   const [downloadReport] = useLazyDownloadReportFileQuery();

//   const formatDate = (date) => {
//     if (!date) return "—";
//     return new Date(date).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handlePreview = async (filename) => {
//     if (!filename) return;
//     try {
//       const blob = await previewReport(filename).unwrap();
//       const url = URL.createObjectURL(blob);
//       window.open(url, "_blank");
//     } catch (err) {
//       console.error("Preview failed:", err);
//       alert("Failed to preview file");
//     }
//   };

//   const handleDownload = async (filename) => {
//     if (!filename) return;
//     try {
//       const blob = await downloadReport(filename).unwrap();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Download failed:", err);
//       alert("Failed to download file");
//     }
//   };

//   if (!memberId) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
//         <div className="text-6xl mb-3">🏥</div>
//         <h2 className="text-lg font-semibold">No Member Selected</h2>
//         <p className="text-sm">Please select a member to view reports</p>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[60vh]">
//         <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
//         <p className="text-gray-600 font-medium">Loading reports...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 text-red-700 p-4 rounded-lg">
//         Failed to load reports. Please try again.
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
//         <div className="text-6xl mb-3">📄</div>
//         <h2 className="text-lg font-semibold">No Reports Found</h2>
//         <p className="text-sm">No medical reports available</p>
//       </div>
//     );
//   }
//   const totalReports = data.reduce((sum, report) => sum + report.details.length, 0);
//   return (
// <div className="p-6">
//   <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-xl shadow-lg border border-gray-200">
//     <table className="w-full border-collapse bg-white">
//       <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white sticky top-0">
//         <tr>
//           <th className="p-4 text-left">Sr.NO</th>
//           <th className="p-4 text-left">Doc Date</th>
//           <th className="p-4 text-left">Purpose</th>
//           <th className="p-4 text-left">Report Name</th>
//           <th className="p-4 text-left">Doctor / Hospital</th>
//           <th className="p-4 text-left">Report Date</th>
//           <th className="p-4 text-left">Attachment</th>
//         </tr>
//       </thead>

//       <tbody>
//         {data.map((report) =>
//           report.details.map((detail, index) => {
//             const filename = detail.uploaded_file_report
//               ? detail.uploaded_file_report.replace(/\\/g, "/").split("/").pop()
//               : null;

//             return (
//               <tr key={detail.detail_id} className="border-b hover:bg-indigo-50 transition">
//                 <td className="p-4 font-semibold text-gray-700">{report.doc_No}</td>
//                 <td className="p-4">
//                   <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md text-sm font-medium">
//                     {formatDate(report.doc_date)}
//                   </span>
//                 </td>
//                 <td className="p-4 text-gray-600">{report.purpose}</td>
//                 <td className="p-4 font-medium text-gray-800">{detail.report_name || "—"}</td>
//                 <td className="p-4 text-gray-600">{detail.Doctor_and_Hospital_name || "—"}</td>
//                 <td className="p-4 text-gray-500">{formatDate(detail.report_date)}</td>
//                 <td className="p-4">
//                   {filename ? (
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handlePreview(filename)}
//                       >
//                         👁 
//                       </button>
//                       <button
//                         onClick={() => handleDownload(filename)}
//                       >
//                         ⬇ 
//                       </button>
//                     </div>
//                   ) : (
//                     <span className="text-gray-400 italic">No file</span>
//                   )}
//                 </td>
//               </tr>
//             );
//           })
//         )}
//       </tbody>
//     </table>
//   </div>

//   <div className="flex justify-between mt-4 text-sm text-gray-500">
//     <span>
//       Showing {totalReports} report{totalReports > 1 ? "s" : ""}
//     </span>
//     <span>Updated: {new Date().toLocaleDateString()}</span>
//   </div>
// </div>

//   );
// };

// export default MemberReportTable;

import React from "react";
import {
  useGetUserListByMemberIdQuery,
  useLazyDownloadReportFileQuery,
  useLazyPreviewReportFileQuery,
} from "../services/memberReportApi";

const MemberReportTable = () => {
  const memberId = sessionStorage.getItem("member_id");

  const { data, isLoading, error } = useGetUserListByMemberIdQuery(memberId, {
    skip: !memberId,
  });

  const [previewReport] = useLazyPreviewReportFileQuery();
  const [downloadReport] = useLazyDownloadReportFileQuery();

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePreview = async (filename) => {
    if (!filename) return;
    const blob = await previewReport(filename).unwrap();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDownload = async (filename) => {
    if (!filename) return;
    const blob = await downloadReport(filename).unwrap();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ------------------ UI STATES ------------------ */

  if (!memberId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <div className="text-6xl mb-3">🏥</div>
        <h2 className="text-lg font-semibold">No Member Selected</h2>
        <p className="text-sm">Please select a member to view reports</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        Failed to load reports
      </div>
    );
  }

  /* ✅ CALCULATE TOTAL REPORTS */
  const totalReports =
    data?.reduce((sum, report) => sum + report.details.length, 0) || 0;

  /* ✅ SHOW NOTHING IF NO REPORTS */
  if (totalReports === 0) {
    return null;
  }

  /* ------------------ TABLE ------------------ */

  let srNo = 1;

  return (
    <div className="p-6">
      <div className="overflow-x-auto max-h-[500px] rounded-xl shadow border">
        <table className="w-full bg-white">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="p-4 text-left">Sr. No</th>
              <th className="p-4 text-left">Doc Date</th>
              <th className="p-4 text-left">Purpose</th>
              <th className="p-4 text-left">Report Name</th>
              <th className="p-4 text-left">Doctor / Hospital</th>
              <th className="p-4 text-left">Report Date</th>
              <th className="p-4 text-left">Attachment</th>
            </tr>
          </thead>

          <tbody>
            {data.map((report) =>
              report.details.map((detail) => {
                const filename = detail.uploaded_file_report
                  ?.replace(/\\/g, "/")
                  .split("/")
                  .pop();

                return (
                  <tr key={detail.detail_id} className="border-b">
                    <td className="p-4">{srNo++}</td>
                    <td className="p-4">{formatDate(report.doc_date)}</td>
                    <td className="p-4">{report.purpose}</td>
                    <td className="p-4">{detail.report_name}</td>
                    <td className="p-4">
                      {detail.Doctor_and_Hospital_name}
                    </td>
                    <td className="p-4">
                      {formatDate(detail.report_date)}
                    </td>
                    <td className="p-3">
                      {filename && (
                        <div className="flex gap-3">
                          <button onClick={() => handlePreview(filename)}>👁</button>
                          <button onClick={() => handleDownload(filename)}>⬇</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberReportTable;
