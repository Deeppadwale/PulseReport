import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetFamilyMastersQuery } from "../services/familyMasterApi"; // Make sure this API hook exists


function FamilyMasterList() {
  const navigate = useNavigate();
   const User_Type = sessionStorage.getItem("User_Type");

  const { data: families = [], isLoading, isError } = useGetFamilyMastersQuery();

  useEffect(() => {
    // If no families, optionally redirect to a create-family page or show message
    if (!isLoading && families.length === 0) {
      navigate("/app/no-families"); 
    }
  }, [families, isLoading, navigate]);

  if (isLoading)
    return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (isError)
    return <div className="text-red-500 text-center mt-6">Failed to load families</div>;

  const handleClick = (family) => {
    // Save family info in sessionStorage
    // sessionStorage.setItem("family_id", family.Family_id);
    // sessionStorage.setItem("family_name", family.Family_Name || "");
    // sessionStorage.setItem("User_Type", family.User_Type);
    if(User_Type == 'M'){
    sessionStorage.setItem("family_id", family.Family_id);
    sessionStorage.setItem("Family_Name", family.Family_Name || "");

    }
    else{
    sessionStorage.setItem("family_id", family.Family_id);
    sessionStorage.setItem("Family_Name", family.Family_Name || "");
    sessionStorage.setItem("User_Type", family.User_Type);
    }


    // Navigate to member list
    navigate("/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-gray-800"
      >
       Family List
      </motion.h1>

      <div className="space-y-4 w-full max-w-md">
        {families.map((family, index) => (
          <motion.div
            key={family.Family_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleClick(family)}
            className="bg-white rounded-xl shadow-md p-4 text-center cursor-pointer hover:shadow-xl"
          >
            <p className="text-xl font-semibold text-gray-800">{family.Family_id} . {family.Family_Name}</p>
            {/* <p className="text-sm text-gray-500">ID: {family.Family_id}</p> */}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default FamilyMasterList;
