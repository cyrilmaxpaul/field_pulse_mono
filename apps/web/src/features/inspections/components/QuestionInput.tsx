import {
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Rating,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { InspectionQuestion } from "../types";

export function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: InspectionQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (question.questionType) {
    case "YES_NO":
      return (
        <ToggleButtonGroup
          exclusive
          value={value === true ? "yes" : value === false ? "no" : null}
          onChange={(_, next) => next && onChange(next === "yes")}
        >
          <ToggleButton value="yes">Yes</ToggleButton>
          <ToggleButton value="no">No</ToggleButton>
        </ToggleButtonGroup>
      );

    case "PASS_FAIL":
      return (
        <ToggleButtonGroup exclusive value={value ?? null} onChange={(_, next) => next && onChange(next)}>
          <ToggleButton value="PASS" color="success">
            Pass
          </ToggleButton>
          <ToggleButton value="FAIL" color="error">
            Fail
          </ToggleButton>
        </ToggleButtonGroup>
      );

    case "CHECKBOX":
      return (
        <FormControlLabel
          control={<Checkbox checked={value === true} onChange={(e) => onChange(e.target.checked)} />}
          label="Yes"
        />
      );

    case "SINGLE_SELECT":
      return (
        <RadioGroup value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {(question.options ?? []).map((option) => (
            <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
          ))}
        </RadioGroup>
      );

    case "MULTI_SELECT": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <FormGroup>
          {(question.options ?? []).map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={selected.includes(option)}
                  onChange={(e) =>
                    onChange(e.target.checked ? [...selected, option] : selected.filter((o) => o !== option))
                  }
                />
              }
              label={option}
            />
          ))}
        </FormGroup>
      );
    }

    case "TEXT":
      return (
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "NUMBER":
    case "DECIMAL":
    case "MEASUREMENT":
      return (
        <TextField
          fullWidth
          type="number"
          value={value === undefined || value === null ? "" : (value as number)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );

    case "DATE":
      return (
        <TextField
          fullWidth
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "TIME":
      return (
        <TextField
          fullWidth
          type="time"
          slotProps={{ inputLabel: { shrink: true } }}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "RATING":
      return <Rating value={(value as number) ?? 0} onChange={(_, next) => onChange(next)} />;

    case "PHOTO":
    case "SIGNATURE":
      return (
        <Alert severity="info">
          {question.questionType === "PHOTO" ? "Photo capture" : "Signature capture"} is available in a later phase
          (Evidence Management). This question cannot be answered yet.
        </Alert>
      );

    default:
      return null;
  }
}
