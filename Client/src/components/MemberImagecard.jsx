import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import {
  useGetMemberMastersQuery,
  useGetMemberUserImageQuery,
} from "../services/medicalAppoinmentApi";

// Update component to accept onMemberSelect prop
export default function MemberCardView({ onMemberSelect }) {
  const familyId = sessionStorage.getItem("family_id");

  const { data: members = [], isLoading, isError } = useGetMemberMastersQuery(familyId, {
    skip: !familyId,
  });

  if (isLoading) {
    return <div className="text-center py-10">Loading members...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">Failed to load members</div>;
  }

  // Function to handle member click - pass member data to parent
  const handleSelect = (member) => {
    console.log("Selected member data:", member);
    if (onMemberSelect) {
      onMemberSelect(member);
    }
  };

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex flex-row items-center space-x-4">
        {members.map((member) => (
          <MemberCard key={member.Member_id} member={member} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------- */
/* Single Member Card        */
/* ------------------------- */
function MemberCard({ member, onSelect }) {
  const [imageUrl, setImageUrl] = useState(null);

  const { data: imageBlob, isLoading } = useGetMemberUserImageQuery(
    { member_id: member.Member_id },
    { skip: !member?.Member_id }
  );

  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageBlob]);

  return (
    <div
      onClick={() => onSelect(member)}
      className="flex flex-col items-center cursor-pointer min-w-[10px] hover:scale-105 transition-transform duration-200"
    >
      {/* Member Image */}
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 hover:border-blue-400">
      {isLoading ? (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={member.Member_name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-blue-600 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>


      {/* Member Name */}
      <p className="mt-1 text-sm font-medium text-gray-800 whitespace-nowrap text-center">
        {member.Member_name}
      </p>
    </div>
  );
}