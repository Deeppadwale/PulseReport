import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ExportButton = ({
    data,
    sponsors,
    onSuccess,
    onError,
    fileNamePrefix = "Export",
    requiredFields = [],
    className = "",
    buttonText = "Export"
}) => {

    const handleExport = () => {
        for (const field of requiredFields) {
            if (!data[field]) {
                if (onError) {
                    onError(`Please fill in ${field} field first!`);
                }
                return;
            }
        }

        let sponsorName = 'Unknown Sponsor';
        if (data.SponsorMasterId && sponsors) {
            const selectedSponsor = sponsors.find(sponsor =>
                sponsor.SponsorMasterId === Number(data.SponsorMasterId)
            );
            sponsorName = selectedSponsor ? selectedSponsor.Sponsor_Name : 'Unknown Sponsor';
        }

        const textContent = `
        ${fileNamePrefix.toUpperCase()}
        ${'='.repeat(fileNamePrefix.length + 7)}

        Sponsor Name: ${sponsorName}
        Designation: ${data.designation || data.Designation || 'Not specified'}
        Speaker Name: ${data.Speaker_Name || 'Not specified'}

        BIOGRAPHY:
        ${data.NetworkingSlotSession_Bio || data.bio || data.MinisterialSession_Bio || data.SecretarialRoundTable_Bio || data.Speaker_Bio || data.CuratedSession_Bio || 'No biography available'}

        Export Date: ${new Date().toLocaleDateString()}
        Export Time: ${new Date().toLocaleTimeString()}
        `.trim();

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sponsorName}_${data.NetworkingSlotId || data.MinisterialSessionId || data.id || ''}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (onSuccess) {
            onSuccess(`${fileNamePrefix} exported successfully!`);
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            className={`flex items-center px-3 py-1.5 text-xs 
        border border-pink-500 
        rounded-md text-pink-600 
        bg-white hover:bg-pink-50 
        focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-pink-500 
        transition-colors duration-200 
        ${className}`}
            title={`Export ${fileNamePrefix} to Text File`}
        >
            <ArrowDownTrayIcon className="h-3 w-3 mr-1 text-pink-600" />
            {buttonText}
        </button>

    );
};

export default ExportButton;