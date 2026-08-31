import { Box, Button, IconButton, Paper, Stack, TextField } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import { QuestionRow } from "./QuestionRow";
import { newLocalId, type LocalQuestion, type LocalSection } from "../types/builder";

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function SectionCard({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  readOnly = false,
}: {
  section: LocalSection;
  onChange: (next: LocalSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  readOnly?: boolean;
}) {
  const updateQuestion = (index: number, next: LocalQuestion) => {
    const questions = [...section.questions];
    questions[index] = next;
    onChange({ ...section, questions });
  };

  const deleteQuestion = (index: number) => {
    onChange({ ...section, questions: section.questions.filter((_, i) => i !== index) });
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    onChange({ ...section, questions: arrayMove(section.questions, index, index + direction) });
  };

  const addQuestion = () => {
    const question: LocalQuestion = {
      localId: newLocalId("question"),
      questionKey: newLocalId("q"),
      label: "",
      questionType: "TEXT",
      isRequired: false,
      evidenceRequired: false,
      options: [],
    };
    onChange({ ...section, questions: [...section.questions, question] });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <Stack>
          <IconButton size="small" onClick={onMoveUp} disabled={isFirst || readOnly}>
            <ArrowUpwardIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={onMoveDown} disabled={isLast || readOnly}>
            <ArrowDownwardIcon fontSize="inherit" />
          </IconButton>
        </Stack>
        <TextField
          label="Section title"
          size="small"
          fullWidth
          disabled={readOnly}
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
        <IconButton onClick={onDelete} disabled={readOnly}>
          <DeleteOutlineIcon />
        </IconButton>
      </Stack>

      <Box sx={{ pl: 5 }}>
        {section.questions.map((question, index) => (
          <QuestionRow
            key={question.localId}
            question={question}
            onChange={(next) => updateQuestion(index, next)}
            onDelete={() => deleteQuestion(index)}
            onMoveUp={() => moveQuestion(index, -1)}
            onMoveDown={() => moveQuestion(index, 1)}
            isFirst={index === 0}
            isLast={index === section.questions.length - 1}
            readOnly={readOnly}
          />
        ))}
        {!readOnly && (
          <Button startIcon={<AddIcon />} onClick={addQuestion} size="small">
            Add Question
          </Button>
        )}
      </Box>
    </Paper>
  );
}
