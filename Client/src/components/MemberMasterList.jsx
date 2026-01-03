import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useGetMemberMastersQuery, useGetMemberUserImageQuery } from "../services/medicalAppoinmentApi";

function MemberMasterList() {
  const navigate = useNavigate();
  const familyId = sessionStorage.getItem("family_id");
  const family_name = sessionStorage.getItem("Family_Name");
   const User_Type = sessionStorage.getItem("User_Type");

  const { data: members = [], isLoading, isError } =
    useGetMemberMastersQuery(familyId, { skip: !familyId });

  if (!isLoading && members.length === 0) navigate("/app/member-master");
 
  const handleClick = (member) => {
    if(User_Type == 'M'){
    sessionStorage.setItem("member_id", member.Member_id);
    sessionStorage.setItem("User_Name", member.Member_name);
    // sessionStorage.setItem("family_name", member.Family_Name);
    }
    else{
    sessionStorage.setItem("member_id", member.Member_id);
    sessionStorage.setItem("User_Name", member.Member_name);
    // sessionStorage.setItem("family_name", member.Family_Name);
    sessionStorage.setItem("User_Type", member.User_Type);
    }
  
    navigate("/app/dashboard");
  };

  if (isLoading)
    return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (isError)
    return <div className="text-red-500 text-center mt-6">Failed to load members</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-gray-800"
      >
        {family_name} Members
      </motion.h1>

      <div className="space-y-1 w-full max-w-md">
        {members.map((member, index) => (
          <MemberCard 
            key={member.Member_id} 
            member={member} 
            index={index} 
            onClick={() => handleClick(member)} 
          />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member, index, onClick }) {
  const { data: imageBlob, isLoading: imageLoading } = useGetMemberUserImageQuery(
    { member_id: member.Member_id },
    { skip: !member.Member_id }
  );

  const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-md  cursor-pointer hover:shadow-xl flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
        {imageLoading ? (
          <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
            <User className="h-6 w-6 text-slate-400" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onLoad={() => URL.revokeObjectURL(imageUrl)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      <div className="text-left flex-1">
        <p className="text-lg font-semibold text-gray-800">
          {member.Member_name}
        </p>
        <p className="text-sm text-gray-600">
          {member.Mobile_no}
        </p>
      </div>
    </motion.div>
  );
}
export default MemberMasterList;