import React, { useEffect } from "react";
import { toast } from "react-toastify";

const FieldSelector = ({
  selectedFile,
  labelField,
  setLabelField,
  valueField,
  setValueField,
}) => {
  useEffect(() => {
    if (!selectedFile?.data?.length) {
      toast.error("No data found in the selected file.");
    }
  }, [selectedFile]);

  if (!selectedFile?.data?.length) return null;

  const fields = Object.keys(selectedFile.data[0]);

  return (
    <div className="field-selectors">
      <div className="field-selector">
        <label htmlFor="label-field">Label Field:</label>
        <select
          id="label-field"
          value={labelField}
          onChange={(e) => setLabelField(e.target.value)}
          className="field-dropdown"
          aria-label="Select label field"
        >
          {fields.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <div className="field-selector">
        <label htmlFor="value-field">Value Field:</label>
        <select
          id="value-field"
          value={valueField}
          onChange={(e) => setValueField(e.target.value)}
          className="field-dropdown"
          aria-label="Select value field"
        >
          {fields.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FieldSelector;
