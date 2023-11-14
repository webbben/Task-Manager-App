import { Accordion, Box, Button, Card, TextField, styled } from "@mui/material";

/**
 * ===
 * File to hold custom styled components to be shared around the app.
 * ===
 */


/**
 * Text field with white borders.
 */
export const TextFieldWhite = styled(TextField)`
  & label.Mui-focused {
    color: white;
  }
  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: white;
    }
  }
`;

export const AcceptButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  borderColor: theme.palette.primary.contrastText,
  "&:hover": {
      color: 'green',
      borderColor: 'green',
  }
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  borderColor: theme.palette.primary.contrastText,
  "&:hover": {
      color: 'red',
      borderColor: 'red'
  }
}));

export const SecondaryCard = styled(Card)(({ theme, weekend }) => ({
  backgroundColor: weekend ? '#4b248a' : theme.palette.secondary.main,
  borderRadius: "15px",
  marginTop: '0.5em',
  marginBottom: '0.5em',
  padding: '0.5em'
}));

export const SlimAccordion = styled(Accordion)`
  & .css-1betqn-MuiAccordionSummary-content {
    margin: 0;
  }
  & .css-1d6tq6y-MuiButtonBase-root-MuiAccordionSummary-root {
    padding: 0 0.5em;
  }
`;

export const FlexBox = styled(Box)({
  display: 'flex',
  flexDirection: 'row', 
  alignItems: 'flex-start'
});