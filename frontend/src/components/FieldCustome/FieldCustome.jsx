import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Autocomplete
} from '@mui/material'

function FieldCustome({ label, val, func, type = 'text', options = [], multiple = false, onChange }) {
  const handleChange = (event) => {
    const value = event.target.value
    func(value)
    onChange?.(value)
  }

  if (type === 'select') {
    return (
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          value={val}
          onChange={handleChange}
          multiple={multiple}
          renderValue={(selected) =>
            multiple
              ? selected.map(id => options.find(opt => opt.value === id)?.label).join(', ')
              : options.find(opt => opt.value === val)?.label || ''
          }
          MenuProps={{ disableScrollLock: true }}
        >
          {options.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {multiple && <Checkbox checked={val?.includes(opt.value)} />}
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  if (type === 'autocomplete') {
    const selectedOption = options.find(o => o.value === val)
    const valueObject = selectedOption || (val ? { label: val, value: val } : null)

    return (
      <Autocomplete
        fullWidth
        options={options}
        freeSolo
        getOptionLabel={(option) => option.label || ''}
        filterOptions={(opts, state) =>
          opts.filter(o =>
            o.label?.toLowerCase().includes(state.inputValue.toLowerCase())
          )
        }
        isOptionEqualToValue={(opt, val) => opt.value === val?.value}
        value={valueObject}
        onChange={(_, newVal) => {
          const newValue = newVal?.value || (typeof newVal === 'string' ? newVal : '')
          func(newValue)
          onChange?.(newValue)
        }}
        onInputChange={(_, inputVal, reason) => {
          if (reason === 'input') {
            func(inputVal)
            onChange?.(inputVal)
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label={label} sx={{ mt: 2 }} />
        )}
      />
    )
  }

  if (type === 'date') {
    const formatDate = (v) => {
      if (!v) return ''
      if (v instanceof Date) return v.toISOString().slice(0, 10)
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
      return ''
    }

    return (
      <TextField
        fullWidth
        label={label}
        value={formatDate(val)}
        onChange={(e) => func(e.target.value)}
        type="date"
        InputLabelProps={{ shrink: true }}
        sx={{
          mt: 2,
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            filter: (theme) =>
              theme.palette.mode === 'light' ? 'invert(0.3)' : 'invert(0.7)',
            cursor: 'pointer',
          }
        }}
      />
    )
  }

  return (
    <TextField
      fullWidth
      label={label}
      value={val ?? ''}
      onChange={(e) => {
        const newValue = type === 'number' ? Number(e.target.value) : e.target.value
        func(newValue)
        onChange?.(newValue)
      }}
      type={type}
      sx={{ mt: 2 }}
      autoComplete="off"
    />
  )
}

export default FieldCustome
