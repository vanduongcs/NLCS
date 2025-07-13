import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Autocomplete from '@mui/material/Autocomplete'

function FieldCustome({ label, val, func, type, options, multiple, onChange }) {
  const handleChange = (event) => {
    func(event.target.value)
    if (onChange) {
      onChange(event.target.value)
    }
  }

  if (type === 'select') {
    return (
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          multiple={multiple}
          value={val}
          onChange={handleChange}
          MenuProps={{ disableScrollLock: true }}
          label={label}
          renderValue={(selected) =>
            multiple
              ? selected.map((id) => options.find((option) => option.value === id)?.label || '').join(', ')
              : options.find((option) => option.value === val)?.label || ''
          }
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {multiple && <Checkbox checked={val.includes(option.value)} />}
              <ListItemText primary={option.label || ''} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  if (type === 'autocomplete') {
    const selectedOption = options?.find(option => option.value === val) || null

    return (
      <Autocomplete
        fullWidth
        options={options || []}
        getOptionLabel={(option) => option.label || ''}
        filterOptions={(opts, { inputValue }) =>
          opts.filter(opt =>
            opt.label?.toLowerCase().includes(inputValue.toLowerCase())
          )
        }
        isOptionEqualToValue={(option, value) => option.value === value.value}
        value={selectedOption}
        onChange={(event, newValue) => {
          func(newValue ? newValue.value : '')
          if (onChange) onChange(newValue ? newValue.value : '')
        }}
        renderInput={(params) => (
          <TextField {...params} label={label} sx={{ mt: 2 }} />
        )}
      />
    )
  }

  if (type === 'date') {
    const formattedValue = val instanceof Date
      ? val.toISOString().slice(0, 10)
      : (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)
        ? val
        : '')

    return (
      <TextField
        fullWidth
        label={label}
        value={formattedValue}
        onChange={(e) => func(e.target.value)}
        sx={{
          mt: 2,
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            filter: (theme) =>
              theme.palette.mode === 'light'
                ? 'invert(0.3)'
                : 'invert(0.7)',
            cursor: 'pointer',
          },
        }}
        type="date"
        InputLabelProps={{ shrink: true }}
      />
    )
  }

  return (
    <TextField
      fullWidth
      label={label}
      value={val || ''}
      onChange={(e) => {
        const newValue = type === 'number' ? Number(e.target.value) : e.target.value
        func(newValue)
      }}
      sx={{ mt: 2 }}
      type={type === 'number' ? 'number' : type}
      autoComplete="off"
    />
  )
}

export default FieldCustome
