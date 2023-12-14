import React from "react";

export interface TitleInputProps {
  title: string;
  setTitle: (title: string) => void;
}

export const TitleInput: React.FC<TitleInputProps> = ({ title, setTitle }) => {
  return (
    <div className="">
      <input
        className="border-2 bg-gray-900 text-green-400 p-2 mb-2 w-full outline-none caret-green-400 focus:outline-none"
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
  );
};
