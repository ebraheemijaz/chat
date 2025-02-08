import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import ChatRequest from "./ChatRequest";
import Link from "next/link";

export default function UserProfile({
  name,
  course,
  college,
  code,
  advice,
  description,
  bio,
  isVerified,
  profileImage,
  isMyCourse,
  courseOwnerId,
  email,
}) {
  return (
    <div
      className="relative border border-gray-300 rounded-lg p-4 w-full max-w-md mx-auto bg-white text-[#32064A] mb-6"
      style={{ height: "350px", maxWidth: "520px" }}
    >
      <div className="flex items-center">
        {/* Circular Profile Picture */}
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="User Photo"
              width={80}
              height={80}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <Image
              src="/profile-pic.png"
              alt="Default Photo"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold flex items-center">
            {name}
            {isVerified && (
              <FaCheckCircle
                className="ml-2 text-blue-500"
                size={20}
                title="Verified Badge"
              />
            )}
          </h2>
          <h3 className="text-sm italic">
            {course}, {code}
          </h3>
          <p className="text-sm italic">{college}</p>
        </div>
      </div>

      <div className="mt-4">
        <p>
          <strong>Top Advice:</strong> {advice}
        </p>
        <br></br>
        <p>
          <strong>Description:</strong> {description}
        </p>
        <br></br>
        <p>
          <strong>Bio:</strong> {bio}
        </p>
      </div>

      <div className="flex space-x-4 mt-4">
        {!isMyCourse && (
          // <Link href={`/chat`}>Send Chat Request</Link>
          <ChatRequest courseId={course} courseOwnerId={courseOwnerId} />
        )}
        <a
          href="#"
          className="border border-[#32064A] text-[#32064A] px-4 py-2 rounded-full hover:bg-[#32064A] hover:text-white transition"
        >
          See More
        </a>
      </div>
    </div>
  );
}
