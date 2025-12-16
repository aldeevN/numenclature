import { useState, ChangeEvent, useEffect, useMemo } from 'react';

interface FieldValues {
  name: string;
  brand: string;
}

interface ModelYearPair {
  carBrand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  id: string;
  keepUppercase?: boolean;
}

interface ValidationErrors {
  yearFrom?: string;
  yearTo?: string;
}

interface OilSpecification {
  type: string;
  brand: string;
  viscosity: string;
  specification: string;
  volume: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  result: string;
  mode: 'parts' | 'oils';
  data: {
    fields: FieldValues;
    modelYearPairs?: ModelYearPair[];
    oilSpec?: OilSpecification;
  };
}

export default function App() {
  const [mode, setMode] = useState<'parts' | 'oils'>('parts');
  const [fields, setFields] = useState<FieldValues>({
    name: '',
    brand: '',
  });
  const [modelYearPairs, setModelYearPairs] = useState<ModelYearPair[]>([
    { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-0', keepUppercase: false }
  ]);
  const [oilSpec, setOilSpec] = useState<OilSpecification>({
    type: 'Моторное',
    brand: 'HYUNDAI/XTeer',
    viscosity: '15w40',
    specification: 'HD 7000 CI-4',
    volume: '1л'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationErrors>>({});
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState<{
    field: string;
    values: string[];
    position: { top: number; left: number };
  } | null>(null);

  // Загружаем историю из localStorage при загрузке
  useEffect(() => {
    const savedHistory = localStorage.getItem('carPartsHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Сортируем по времени (новые сверху)
        const sortedHistory = parsedHistory.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp);
        setHistory(sortedHistory);
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    }
  }, []);

  // Сохраняем историю в localStorage при изменении
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('carPartsHistory', JSON.stringify(history));
    }
  }, [history]);

  // Функция для добавления результата в историю
  const addToHistory = (result: string) => {
    if (!result || result === 'Пожалуйста, исправьте ошибки валидации') {
      return;
    }

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      result,
      mode,
      data: {
        fields: { ...fields },
        modelYearPairs: mode === 'parts' ? [...modelYearPairs] : undefined,
        oilSpec: mode === 'oils' ? { ...oilSpec } : undefined
      }
    };

    setHistory(prev => {
      const newHistory = [newHistoryItem, ...prev];
      // Ограничиваем историю 50 записями
      return newHistory.slice(0, 50);
    });
  };

  // Функция для применения истории к текущим полям
  const applyHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    
    if (item.data.fields) {
      setFields(item.data.fields);
    }
    
    if (item.mode === 'parts' && item.data.modelYearPairs) {
      setModelYearPairs(item.data.modelYearPairs);
    }
    
    if (item.mode === 'oils' && item.data.oilSpec) {
      setOilSpec(item.data.oilSpec);
    }
    
    setShowHistory(false);
  };

  // Функция для очистки истории
  const clearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить всю историю?')) {
      setHistory([]);
      localStorage.removeItem('carPartsHistory');
    }
  };

  // Получаем уникальные значения для автозаполнения из истории
  const autocompleteValues = useMemo(() => {
    const values: Record<string, Set<string>> = {
      name: new Set(),
      brand: new Set(),
      carBrand: new Set(),
      model: new Set(),
      oilType: new Set(),
      oilBrand: new Set(),
      oilViscosity: new Set(),
      oilSpecification: new Set(),
      oilVolume: new Set()
    };

    history.forEach(item => {
      if (item.data.fields.name) values.name.add(item.data.fields.name);
      if (item.data.fields.brand) values.brand.add(item.data.fields.brand);
      
      if (item.mode === 'parts' && item.data.modelYearPairs) {
        item.data.modelYearPairs.forEach(pair => {
          if (pair.carBrand) values.carBrand.add(pair.carBrand);
          if (pair.model) values.model.add(pair.model);
        });
      }
      
      if (item.mode === 'oils' && item.data.oilSpec) {
        const { type, brand, viscosity, specification, volume } = item.data.oilSpec;
        if (type) values.oilType.add(type);
        if (brand) values.oilBrand.add(brand);
        if (viscosity) values.oilViscosity.add(viscosity);
        if (specification) values.oilSpecification.add(specification);
        if (volume) values.oilVolume.add(volume);
      }
    });

    // Преобразуем Set в массивы и фильтруем пустые значения
    const result: Record<string, string[]> = {};
    Object.keys(values).forEach(key => {
      const arr = Array.from(values[key as keyof typeof values]).filter(val => val.trim() !== '');
      if (arr.length > 0) {
        result[key] = arr;
      }
    });

    return result;
  }, [history]);

  // Функция для форматирования
  const capitalizeWords = (str: string): string => {
    if (str.length === 0) return str;
    
    const words = str.split(' ');
    const result: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length === 0) {
        result.push('');
        continue;
      }
      
      if (i === 0) {
        result.push(word.charAt(0).toUpperCase() + word.slice(1));
      } else {
        result.push(word);
      }
    }
    
    return result.join(' ');
  };

  const formatCarBrand = (str: string, keepUppercase: boolean = false): string => {
    if (str.length === 0) return str;
    
    if (keepUppercase) {
      return str.trim().replace(/\s{2,}/g, ' ');
    }
    
    return str
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
      })
      .join(' ');
  };

  const formatFieldValue = (value: string): string => {
    return capitalizeWords(value);
  };

  const handleChange = (field: keyof FieldValues, value: string, event?: ChangeEvent<HTMLInputElement>) => {
    const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
    const formattedValue = formatFieldValue(singleSpacedValue);
    setFields(prev => ({ ...prev, [field]: formattedValue }));
    
    // Показываем автозаполнение если есть совпадения
    if (event && value.trim() !== '') {
      const fieldKey = field === 'name' ? 'name' : 'brand';
      const suggestions = autocompleteValues[fieldKey]?.filter(v => 
        v.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      if (suggestions && suggestions.length > 0) {
        const inputRect = event.target.getBoundingClientRect();
        setShowAutocomplete({
          field: fieldKey,
          values: suggestions,
          position: {
            top: inputRect.bottom + window.scrollY,
            left: inputRect.left + window.scrollX
          }
        });
      } else {
        setShowAutocomplete(null);
      }
    } else {
      setShowAutocomplete(null);
    }
  };

  const handleOilSpecChange = (field: keyof OilSpecification, value: string, event?: ChangeEvent<HTMLInputElement>) => {
    const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
    setOilSpec(prev => ({ ...prev, [field]: singleSpacedValue }));
    
    // Показываем автозаполнение если есть совпадения
    if (event && value.trim() !== '') {
      const fieldKey = `oil${field.charAt(0).toUpperCase() + field.slice(1)}`;
      const suggestions = autocompleteValues[fieldKey]?.filter(v => 
        v.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      
      if (suggestions && suggestions.length > 0) {
        const inputRect = event.target.getBoundingClientRect();
        setShowAutocomplete({
          field: fieldKey,
          values: suggestions,
          position: {
            top: inputRect.bottom + window.scrollY,
            left: inputRect.left + window.scrollX
          }
        });
      } else {
        setShowAutocomplete(null);
      }
    } else {
      setShowAutocomplete(null);
    }
  };

  const validateYear = (year: string): string | null => {
    if (year.trim() === '') return null;
    
    const yearRegex = /^\d{2}$|^\d{4}$/;
    if (!yearRegex.test(year)) {
      return 'Год должен состоять из 2 или 4 цифр';
    }
    
    const yearNum = parseInt(year, 10);
    if (year.length === 4 && (yearNum < 1900 || yearNum > 2100)) {
      return 'Некорректный год';
    }
    
    if (year.length === 2 && (yearNum < 0 || yearNum > 99)) {
      return 'Некорректный год';
    }
    
    return null;
  };

  const formatYearForDisplay = (year: string): string => {
    if (year.trim() === '') return '';
    
    const trimmedYear = year.trim();
    if (trimmedYear.length === 4) {
      return trimmedYear.slice(-2);
    }
    return trimmedYear;
  };

  const handleModelChange = (id: string, field: 'carBrand' | 'model' | 'yearFrom' | 'yearTo', value: string, event?: ChangeEvent<HTMLInputElement>) => {
    let formattedValue = value;
    
    if (field === 'carBrand') {
      const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
      const pair = modelYearPairs.find(p => p.id === id);
      formattedValue = formatCarBrand(singleSpacedValue, pair?.keepUppercase);
      
      // Показываем автозаполнение если есть совпадения
      if (event && value.trim() !== '' && field === 'carBrand') {
        const suggestions = autocompleteValues.carBrand?.filter(v => 
          v.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        
        if (suggestions && suggestions.length > 0) {
          const inputRect = event.target.getBoundingClientRect();
          setShowAutocomplete({
            field: 'carBrand',
            values: suggestions,
            position: {
              top: inputRect.bottom + window.scrollY,
              left: inputRect.left + window.scrollX
            }
          });
        } else {
          setShowAutocomplete(null);
        }
      }
    } else if (field === 'model') {
      const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
      formattedValue = formatFieldValue(singleSpacedValue);
      
      // Показываем автозаполнение если есть совпадения
      if (event && value.trim() !== '' && field === 'model') {
        const suggestions = autocompleteValues.model?.filter(v => 
          v.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        
        if (suggestions && suggestions.length > 0) {
          const inputRect = event.target.getBoundingClientRect();
          setShowAutocomplete({
            field: 'model',
            values: suggestions,
            position: {
              top: inputRect.bottom + window.scrollY,
              left: inputRect.left + window.scrollX
            }
          });
        } else {
          setShowAutocomplete(null);
        }
      }
    } else {
      setShowAutocomplete(null);
    }
    
    if (field === 'yearFrom' || field === 'yearTo') {
      const error = validateYear(value);
      setValidationErrors(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: error || undefined
        }
      }));
    }
    
    setModelYearPairs(prev => 
      prev.map(pair => 
        pair.id === id ? { ...pair, [field]: formattedValue } : pair
      )
    );
  };

  const toggleUppercaseMode = (id: string) => {
    setModelYearPairs(prev => 
      prev.map(pair => 
        pair.id === id 
          ? { 
              ...pair, 
              keepUppercase: !pair.keepUppercase,
              carBrand: formatCarBrand(pair.carBrand, !pair.keepUppercase)
            } 
          : pair
      )
    );
  };

  const addModelYearPair = () => {
    setModelYearPairs(prev => [
      ...prev,
      { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-' + prev.length, keepUppercase: false }
    ]);
  };

  const removeModelYearPair = (id: string) => {
    if (modelYearPairs.length > 1) {
      setModelYearPairs(prev => prev.filter(pair => pair.id !== id));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const copyToClipboard = async () => {
    if (!concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации') {
      return;
    }
    
    try {
      const cleanedResult = concatenatedResult.replace(/\s{2,}/g, ' ');
      await navigator.clipboard.writeText(cleanedResult);
      setCopySuccess('Скопировано в буфер обмена!');
      
      // Добавляем в историю после копирования
      addToHistory(cleanedResult);
      
      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    } catch (err) {
      console.error('Ошибка при копировании: ', err);
      setCopySuccess('Ошибка при копировании');
      
      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    }
  };

  const removeDoubleSpaces = (str: string): string => {
    return str.replace(/\s{2,}/g, ' ').trim();
  };

  const formatModelYearPairs = () => {
    const validPairs = modelYearPairs.filter(pair => 
      removeDoubleSpaces(pair.carBrand) !== '' || removeDoubleSpaces(pair.model) !== ''
    );
    
    if (validPairs.length === 0) return '';
    
    const groupedByBrand: Record<string, Array<{
      model: string, 
      yearFrom: string, 
      yearTo: string,
      originalYearFrom: string,
      originalYearTo: string
    }>> = {};
    
    validPairs.forEach(pair => {
      const carBrand = removeDoubleSpaces(pair.carBrand);
      const model = removeDoubleSpaces(pair.model);
      
      const brand = carBrand || '';
      if (!groupedByBrand[brand]) {
        groupedByBrand[brand] = [];
      }
      if (model) {
        groupedByBrand[brand].push({
          model: model,
          yearFrom: formatYearForDisplay(pair.yearFrom),
          yearTo: formatYearForDisplay(pair.yearTo),
          originalYearFrom: pair.yearFrom,
          originalYearTo: pair.yearTo
        });
      } else {
        groupedByBrand[brand].push({
          model: '',
          yearFrom: formatYearForDisplay(pair.yearFrom),
          yearTo: formatYearForDisplay(pair.yearTo),
          originalYearFrom: pair.yearFrom,
          originalYearTo: pair.yearTo
        });
      }
    });

    const result: string[] = [];
    
    Object.entries(groupedByBrand).forEach(([brand, models]) => {
      const nonEmptyModels = models.filter(m => m.model !== '');
      
      if (nonEmptyModels.length === 0 && brand !== '') {
        result.push(brand);
      } else if (nonEmptyModels.length > 0) {
        const formattedModels = nonEmptyModels.map(modelData => {
          const { model: modelName, yearFrom, yearTo } = modelData;
          
          const hasErrors = nonEmptyModels.some(m => 
            (m.originalYearFrom && validateYear(m.originalYearFrom)) || 
            (m.originalYearTo && validateYear(m.originalYearTo))
          );
          
          if (hasErrors) {
            return `${modelName} (ошибка валидации)`;
          }
          
          if (yearFrom && yearTo) {
            return `${modelName} ${yearFrom}->${yearTo}`;
          } else if (yearFrom) {
            return `${modelName} ${yearFrom}->`;
          } else if (yearTo) {
            return `${modelName} ->${yearTo}`;
          } else {
            return modelName;
          }
        });
        
        const hasMultipleBrands = Object.keys(groupedByBrand).length > 1;
        const hasMultipleModels = nonEmptyModels.length > 1;
        
        if (hasMultipleBrands || hasMultipleModels) {
          if (brand) {
            result.push(`${brand} ${formattedModels.join(', ')}`);
          } else {
            result.push(formattedModels.join(', '));
          }
        } else {
          if (brand) {
            result.push(`${brand} ${formattedModels[0]}`);
          } else {
            result.push(formattedModels[0]);
          }
        }
      }
    });

    return result.join(', ');
  };

  const formatOilSpecification = (): string => {
    const parts: string[] = [];
    
    parts.push('Масло');
    if (oilSpec.type) parts.push(removeDoubleSpaces(oilSpec.type.toLowerCase()));
    if (oilSpec.brand) parts.push(`"${removeDoubleSpaces(oilSpec.brand)}"`);
    if (oilSpec.viscosity) parts.push(removeDoubleSpaces(oilSpec.viscosity));
    if (oilSpec.specification) parts.push(removeDoubleSpaces(oilSpec.specification));
    if (oilSpec.volume) parts.push(removeDoubleSpaces(oilSpec.volume));
    
    return parts.join(' ');
  };

  const hasValidationErrors = () => {
    return Object.values(validationErrors).some(errorObj => 
      Object.values(errorObj).some(error => error !== undefined)
    );
  };

  const concatenatedResultForParts = () => {
    if (hasValidationErrors()) {
      return 'Пожалуйста, исправьте ошибки валидации';
    }
    
    const parts: string[] = [];
    
    const name = removeDoubleSpaces(fields.name);
    const brand = removeDoubleSpaces(fields.brand);
    
    if (name) parts.push(name);
    if (brand) parts.push(`"${brand}"`);
    
    const modelYearStr = formatModelYearPairs();
    
    if (modelYearStr) {
      parts.push(modelYearStr);
    }
    
    return removeDoubleSpaces(parts.join(' '));
  };

  const concatenatedResultForOils = () => {
    const parts: string[] = [];
    
    const name = removeDoubleSpaces(fields.name);
    const brand = removeDoubleSpaces(fields.brand);
    
    if (name) parts.push(name);
    if (brand) parts.push(`"${brand}"`);
    
    const oilSpecStr = formatOilSpecification();
    if (oilSpecStr) parts.push(oilSpecStr);
    
    return removeDoubleSpaces(parts.join(' '));
  };

  const concatenatedResult = mode === 'parts' 
    ? concatenatedResultForParts()
    : concatenatedResultForOils();

  const highlightDoubleSpaces = (text: string) => {
    if (!text) return text;
    
    const parts = text.split(/(\s{2,})/g);
    
    return parts.map((part, index) => {
      if (/\s{2,}/.test(part)) {
        return (
          <span key={index} className="bg-red-200 text-red-800 px-1 rounded">
            {part.replace(/ /g, '•')}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const hasDoubleSpaces = concatenatedResult && /\s{2,}/.test(concatenatedResult);

  const fieldConfigs = [
    { id: 'name', label: 'Название', key: 'name' as const },
    { id: 'brand', label: 'Брэнд', key: 'brand' as const },
  ];

  const oilSpecConfigs = [
    { id: 'oil-type', label: 'Тип масла', key: 'type' as const, placeholder: 'Например: Моторное, Трансмиссионное' },
    { id: 'oil-brand', label: 'Брэнд масла', key: 'brand' as const, placeholder: 'Например: HYUNDAI/XTeer' },
    { id: 'oil-viscosity', label: 'Вязкость', key: 'viscosity' as const, placeholder: 'Например: 15w40, 5w30' },
    { id: 'oil-spec', label: 'Спецификация', key: 'specification' as const, placeholder: 'Например: HD 7000 CI-4' },
    { id: 'oil-volume', label: 'Объем', key: 'volume' as const, placeholder: 'Например: 1л, 4л, 5л' },
  ];

  // Функция для выбора значения из автозаполнения
  const handleAutocompleteSelect = (value: string) => {
    if (!showAutocomplete) return;

    switch (showAutocomplete.field) {
      case 'name':
        setFields(prev => ({ ...prev, name: value }));
        break;
      case 'brand':
        setFields(prev => ({ ...prev, brand: value }));
        break;
      case 'carBrand':
        setModelYearPairs(prev => 
          prev.map(pair => 
            pair.id === modelYearPairs[0].id ? { ...pair, carBrand: value } : pair
          )
        );
        break;
      case 'model':
        setModelYearPairs(prev => 
          prev.map(pair => 
            pair.id === modelYearPairs[0].id ? { ...pair, model: value } : pair
          )
        );
        break;
      case 'oilType':
        setOilSpec(prev => ({ ...prev, type: value }));
        break;
      case 'oilBrand':
        setOilSpec(prev => ({ ...prev, brand: value }));
        break;
      case 'oilViscosity':
        setOilSpec(prev => ({ ...prev, viscosity: value }));
        break;
      case 'oilSpecification':
        setOilSpec(prev => ({ ...prev, specification: value }));
        break;
      case 'oilVolume':
        setOilSpec(prev => ({ ...prev, volume: value }));
        break;
    }

    setShowAutocomplete(null);
  };

  // Закрываем автозаполнение при клике вне его
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAutocomplete(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="size-full flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Car Parts Data Concatenator</h1>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              История ({history.length})
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Режим:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setMode('parts')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    mode === 'parts'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Запчасти
                </button>
                <button
                  type="button"
                  onClick={() => setMode('oils')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                    mode === 'oils'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Масла
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Панель истории */}
        {showHistory && (
          <div className="mb-6 border rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">История результатов</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800"
                  disabled={history.length === 0}
                >
                  Очистить историю
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Скрыть
                </button>
              </div>
            </div>
            
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">История пуста</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => applyHistoryItem(item)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.result.length > 80 ? item.result.substring(0, 80) + '...' : item.result}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.mode === 'parts' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.mode === 'parts' ? 'Запчасти' : 'Масла'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldConfigs.map(({ id, label, key }) => (
              <div key={id} className="relative">
                <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  id={id}
                  type="text"
                  value={fields[key]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(key, e.target.value, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={capitalizeWords(label)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Только первое слово с заглавной буквы, остальные - как введены.
                  <br />
                  <span className="text-red-500">Двойные пробелы автоматически удаляются.</span>
                </p>
              </div>
            ))}
          </div>

          {mode === 'parts' ? (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Марка авто, модели и годы выпуска</h3>
                <button
                  type="button"
                  onClick={addModelYearPair}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить модель
                </button>
              </div>

              <div className="space-y-4">
                {modelYearPairs.map((pair, index) => {
                  const pairErrors = validationErrors[pair.id] || {};
                  
                  return (
                    <div key={pair.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="col-span-1 relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700">
                              {`Марка авто ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleUppercaseMode(pair.id)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                pair.keepUppercase
                                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              title={pair.keepUppercase ? "Отключить CAPS" : "Оставить CAPS"}
                            >
                              {pair.keepUppercase ? 'CAPS ВКЛ' : 'CAPS'}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={pair.carBrand}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleModelChange(pair.id, 'carBrand', e.target.value, e)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Например: VW или BMW"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.keepUppercase 
                              ? 'Заглавные буквы сохраняются. Двойные пробелы удаляются.' 
                              : 'Первая буква заглавная, остальные строчные. Двойные пробелы удаляются.'}
                          </p>
                        </div>
                        <div className="relative">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`Модель ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.model}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleModelChange(pair.id, 'model', e.target.value, e)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Например: Passat или X5"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Только первое слово с заглавной буквы. Двойные пробелы удаляются.
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`Год от ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.yearFrom}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleModelChange(pair.id, 'yearFrom', e.target.value, e)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              pairErrors.yearFrom ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Например: 1974 или 74"
                            maxLength={4}
                          />
                          {pairErrors.yearFrom && (
                            <p className="mt-1 text-xs text-red-600">{pairErrors.yearFrom}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.yearFrom && !pairErrors.yearFrom && `Будет показано: ${formatYearForDisplay(pair.yearFrom)}`}
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`Год до ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.yearTo}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleModelChange(pair.id, 'yearTo', e.target.value, e)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              pairErrors.yearTo ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Например: 1997 или 97"
                            maxLength={4}
                          />
                          {pairErrors.yearTo && (
                            <p className="mt-1 text-xs text-red-600">{pairErrors.yearTo}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.yearTo && !pairErrors.yearTo && `Будет показано: ${formatYearForDisplay(pair.yearTo)}`}
                          </p>
                        </div>
                      </div>
                      
                      {modelYearPairs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModelYearPair(pair.id)}
                          className="self-end p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Удалить"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Спецификация масла</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {oilSpecConfigs.map(({ id, label, key, placeholder }) => (
                    <div key={id} className="relative">
                      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <input
                        id={id}
                        type="text"
                        value={oilSpec[key]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOilSpecChange(key, e.target.value, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={placeholder}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Двойные пробелы автоматически удаляются.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Автозаполнение */}
        {showAutocomplete && (
          <div 
            className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
            style={{
              top: showAutocomplete.position.top,
              left: showAutocomplete.position.left,
              minWidth: '200px'
            }}
          >
            {showAutocomplete.values.map((value, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleAutocompleteSelect(value)}
              >
                <div className="text-sm text-gray-700 truncate">{value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {mode === 'parts' ? 'Результат (Запчасти):' : 'Результат (Масла):'}
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  !concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                  />
                </svg>
                Копировать
              </button>
              
              {copySuccess && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md shadow-lg animate-fadeIn">
                  {copySuccess}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md min-h-[60px]">
            <div className={`break-words font-mono ${
              concatenatedResult === 'Пожалуйста, исправьте ошибки валидации' 
                ? 'text-red-600' 
                : 'text-gray-800'
            }`}>
              {concatenatedResult ? (
                <>
                  {highlightDoubleSpaces(concatenatedResult)}
                  {hasDoubleSpaces && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium">Обнаружены двойные пробелы!</p>
                          <p className="mt-1">Двойные пробелы будут автоматически удалены при копировании.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                'Заполните поля выше, чтобы увидеть результат...'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}