import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { QUESTION_TYPES } from "../types";
import { QUESTION_TYPE_LABELS, type LocalQuestion } from "../types/builder";

const OPTIONS_TYPES = new Set(["SINGLE_SELECT", "MULTI_SELECT"]);

export function QuestionRow({
  question,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  readOnly = false,
}: {
  question: LocalQuestion;
  onChange: (next: LocalQuestion) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  readOnly?: boolean;
}) {
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5, mb: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <Stack sx={{ pt: 0.5 }}>
          <IconButton size="small" onClick={onMoveUp} disabled={isFirst || readOnly}>
            <ArrowUpwardIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={onMoveDown} disabled={isLast || readOnly}>
            <ArrowDownwardIcon fontSize="inherit" />
          </IconButton>
        </Stack>

        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <TextField
            label="Question label"
            size="small"
            fullWidth
            disabled={readOnly}
            value={question.label}
            onChange={(e) => onChange({ ...question, label: e.target.value })}
          />

          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              select
              label="Type"
              size="small"
              disabled={readOnly}
              sx={{ minWidth: 180 }}
              value={question.questionType}
              onChange={(e) => onChange({ ...question, questionType: e.target.value as LocalQuestion["questionType"] })}
            >
              {QUESTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {QUESTION_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={question.isRequired}
                  disabled={readOnly}
                  onChange={(e) => onChange({ ...question, isRequired: e.target.checked })}
                />
              }
              label="Required"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={question.evidenceRequired}
                  disabled={readOnly}
                  onChange={(e) => onChange({ ...question, evidenceRequired: e.target.checked })}
                />
              }
              label="Evidence required"
            />
          </Stack>

          {OPTIONS_TYPES.has(question.questionType) && (
            <TextField
              label="Options (comma separated)"
              size="small"
              fullWidth
              disabled={readOnly}
              value={question.options.join(", ")}
              onChange={(e) =>
                onChange({
                  ...question,
                  options: e.target.value
                    .split(",")
                    .map((o) => o.trim())
                    .filter(Boolean),
                })
              }
            />
          )}
        </Stack>

        <IconButton size="small" onClick={onDelete} disabled={readOnly}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
