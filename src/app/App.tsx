import { useState, ChangeEvent } from 'react';

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
}

interface ValidationErrors {
  yearFrom?: string;
  yearTo?: string;
}

// Интерфейс для спецификации масла
interface OilSpecification {
  type: string; // Моторное, трансмиссионное и т.д.
  brand: string; // HYUNDAI/XTeer и т.д.
  viscosity: string; // 15w40, 5w30 и т.д.
  specification: string; // HD 7000 CI-4 и т.д.
  volume: string; // 1л, 4л, 5л и т.д.
}

export default function App() {
  const [mode, setMode] = useState<'parts' | 'oils'>('parts'); // Режим работы: parts или oils
  const [fields, setFields] = useState<FieldValues>({
    name: '',
    brand: '',
  });

  const [modelYearPairs, setModelYearPairs] = useState<ModelYearPair[]>([
    { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-0' }
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

  // Функция для форматирования: первое слово - с заглавной буквы, остальные - как введены
  const capitalizeWords = (str: string): string => {
    if (str.length === 0) return str;
    
    // Разделяем строку на слова, сохраняя пробелы
    const words = str.split(' ');
    const result: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length === 0) {
        result.push('');
        continue;
      }
      
      if (i === 0) {
        // Первое слово: делаем первую букву заглавной, остальные как есть
        result.push(word.charAt(0).toUpperCase() + word.slice(1));
      } else {
        // Все остальные слова оставляем как есть
        result.push(word);
      }
    }
    
    return result.join(' ');
  };

  // Функция для автоматической коррекции ввода (только первое слово с заглавной буквы)
  const formatFieldValue = (value: string): string => {
    return capitalizeWords(value);
  };

  const handleChange = (field: keyof FieldValues, value: string) => {
    // Удаляем двойные пробелы при вводе
    const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
    const formattedValue = formatFieldValue(singleSpacedValue);
    setFields(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Обработчики для спецификации масла
  const handleOilSpecChange = (field: keyof OilSpecification, value: string) => {
    // Удаляем двойные пробелы при вводе
    const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
    setOilSpec(prev => ({ ...prev, [field]: singleSpacedValue }));
  };

  // Валидация года (4 или 2 цифры)
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

  // Форматирование года для отображения (всегда последние 2 цифры)
  const formatYearForDisplay = (year: string): string => {
    if (year.trim() === '') return '';
    
    const trimmedYear = year.trim();
    if (trimmedYear.length === 4) {
      return trimmedYear.slice(-2);
    }
    return trimmedYear;
  };

  const handleModelChange = (id: string, field: 'carBrand' | 'model' | 'yearFrom' | 'yearTo', value: string) => {
    let formattedValue = value;
    
    // Форматируем только текстовые поля (carBrand и model)
    if (field === 'carBrand' || field === 'model') {
      // Удаляем двойные пробелы при вводе
      const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
      formattedValue = formatFieldValue(singleSpacedValue);
    }
    
    // Валидация для годов
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

  const addModelYearPair = () => {
    setModelYearPairs(prev => [
      ...prev,
      { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-' + prev.length }
    ]);
  };

  const removeModelYearPair = (id: string) => {
    if (modelYearPairs.length > 1) {
      setModelYearPairs(prev => prev.filter(pair => pair.id !== id));
      // Удаляем ошибки валидации для удаленной пары
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Функция для копирования текста в буфер обмена
  const copyToClipboard = async () => {
    if (!concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации') {
      return;
    }
    
    try {
      // Удаляем двойные пробелы перед копированием
      const cleanedResult = concatenatedResult.replace(/\s{2,}/g, ' ');
      await navigator.clipboard.writeText(cleanedResult);
      setCopySuccess('Скопировано в буфер обмена!');
      
      // Сбрасываем уведомление через 2 секунды
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

  // Функция для удаления двойных пробелов в строке
  const removeDoubleSpaces = (str: string): string => {
    return str.replace(/\s{2,}/g, ' ');
  };

  // Group by carBrand and format - для режима запчастей
  const formatModelYearPairs = () => {
    // Group pairs by carBrand
    const groupedByBrand: Record<string, Array<{
      model: string, 
      yearFrom: string, 
      yearTo: string,
      originalYearFrom: string,
      originalYearTo: string
    }>> = {};
    
    modelYearPairs.forEach(pair => {
      // Удаляем двойные пробелы в марке и модели
      const carBrand = removeDoubleSpaces(pair.carBrand.trim());
      const model = removeDoubleSpaces(pair.model.trim());
      
      if (model !== '' || carBrand !== '') {
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
        }
      }
    });

    // Format each brand group
    const result: string[] = [];
    
    Object.entries(groupedByBrand).forEach(([brand, models]) => {
      if (models.length === 0) {
        // If only brand is specified without models
        result.push(brand);
      } else {
        // Format each model for this brand
        const formattedModels = models.map(modelData => {
          const { model: modelName, yearFrom, yearTo } = modelData;
          
          // Проверяем есть ли ошибки валидации для этой модели
          const hasErrors = models.some(m => 
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
        
        // Join models and prepend brand if there are multiple models or multiple brands
        const hasMultipleBrands = Object.keys(groupedByBrand).length > 1;
        const hasMultipleModels = models.length > 1;
        
        if (hasMultipleBrands || hasMultipleModels) {
          result.push(`${brand} ${formattedModels.join(', ')}`);
        } else {
          // Single brand, single model - brand is shown only once at the beginning
          result.push(formattedModels[0]);
        }
      }
    });

    return result.join(', ');
  };

  // Форматирование спецификации масла для результата
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

  // Get unique car brands for display in concatenated result
  const getCarBrandForConcatenation = () => {
    const uniqueBrands = Array.from(new Set(
      modelYearPairs
        .map(pair => removeDoubleSpaces(pair.carBrand.trim()))
        .filter(brand => brand !== '')
    ));

    if (uniqueBrands.length === 1) {
      return uniqueBrands[0];
    } else if (uniqueBrands.length > 1) {
      return ''; // Multiple brands will be shown in formatModelYearPairs
    }
    return '';
  };

  // Проверяем есть ли ошибки валидации во всех полях
  const hasValidationErrors = () => {
    return Object.values(validationErrors).some(errorObj => 
      Object.values(errorObj).some(error => error !== undefined)
    );
  };

  // Modified concatenation logic for parts mode
  const concatenatedResultForParts = () => {
    if (hasValidationErrors()) {
      return 'Пожалуйста, исправьте ошибки валидации';
    }
    
    const parts: string[] = [];
    
    // Для полей name и brand сохраняем форматирование (уже сделано в handleChange)
    // Удаляем двойные пробелы
    const name = removeDoubleSpaces(fields.name.trim());
    const brand = removeDoubleSpaces(fields.brand.trim());
    
    if (name) parts.push(name);
    if (brand) parts.push(`"${brand}"`);
    
    // Add car brand if it's the same for all models
    const carBrand = getCarBrandForConcatenation();
    const modelYearStr = formatModelYearPairs();
    
    if (carBrand && !modelYearStr.includes(carBrand)) {
      parts.push(carBrand);
    }
    
    if (modelYearStr) parts.push(modelYearStr);
    
    return parts.join(' ');
  };

  // Concatenation logic for oils mode
  const concatenatedResultForOils = () => {
    const parts: string[] = [];
    
    // Форматируем название и бренд так же как в режиме запчастей
    // Удаляем двойные пробелы
    const name = removeDoubleSpaces(fields.name.trim());
    const brand = removeDoubleSpaces(fields.brand.trim());
    
    if (name) parts.push(name);
    if (brand) parts.push(`"${brand}"`);
    
    // Добавляем спецификацию масла
    const oilSpecStr = formatOilSpecification();
    if (oilSpecStr) parts.push(oilSpecStr);
    
    return parts.join(' ');
  };

  // Общий результат в зависимости от режима
  const concatenatedResult = mode === 'parts' 
    ? concatenatedResultForParts()
    : concatenatedResultForOils();

  // Функция для подсветки двойных пробелов в результате
  const highlightDoubleSpaces = (text: string) => {
    if (!text) return text;
    
    // Находим все двойные пробелы и заменяем их на подсвеченную версию
    const parts = text.split(/(\s{2,})/g);
    
    return parts.map((part, index) => {
      if (/\s{2,}/.test(part)) {
        // Подсвечиваем двойные пробелы красным фоном
        return (
          <span key={index} className="bg-red-200 text-red-800 px-1 rounded">
            {part.replace(/ /g, '•')} {/* Заменяем пробелы на видимые символы */}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Проверяем есть ли двойные пробелы в результате
  const hasDoubleSpaces = concatenatedResult && /\s{2,}/.test(concatenatedResult);

  const fieldConfigs = [
    { id: 'name', label: 'Название', key: 'name' as const },
    { id: 'brand', label: 'Брэнд', key: 'brand' as const },
  ];

  // Конфигурация для полей спецификации масла
  const oilSpecConfigs = [
    { id: 'oil-type', label: 'Тип масла', key: 'type' as const, placeholder: 'Например: Моторное, Трансмиссионное' },
    { id: 'oil-brand', label: 'Брэнд масла', key: 'brand' as const, placeholder: 'Например: HYUNDAI/XTeer' },
    { id: 'oil-viscosity', label: 'Вязкость', key: 'viscosity' as const, placeholder: 'Например: 15w40, 5w30' },
    { id: 'oil-spec', label: 'Спецификация', key: 'specification' as const, placeholder: 'Например: HD 7000 CI-4' },
    { id: 'oil-volume', label: 'Объем', key: 'volume' as const, placeholder: 'Например: 1л, 4л, 5л' },
  ];

  return (
    <div className="size-full flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Car Parts Data Concatenator</h1>
          
          {/* Переключатель режимов */}
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
        
        <div className="space-y-6">
          {/* Основные поля (общие для обоих режимов) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldConfigs.map(({ id, label, key }) => (
              <div key={id}>
                <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  id={id}
                  type="text"
                  value={fields[key]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(key, e.target.value)}
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

          {/* Контент в зависимости от режима */}
          {mode === 'parts' ? (
            /* Модели, марки авто и годы выпуска (режим запчастей) */
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
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`Марка авто ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.carBrand}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleModelChange(pair.id, 'carBrand', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Например: VW или BMW"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Только первое слово с заглавной буквы. Двойные пробелы удаляются.
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`Модель ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.model}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleModelChange(pair.id, 'model', e.target.value)
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
                              handleModelChange(pair.id, 'yearFrom', e.target.value)
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
                              handleModelChange(pair.id, 'yearTo', e.target.value)
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
                
                <div className="text-sm text-gray-500 mt-2">
                  <p>Формат: {`[Марка] [Модель ГодОт->ГодДо]`}</p>
                  <p className="mt-1">Примеры ввода и результата:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Ввод: <code className="text-xs">подшипник ступицы ЗАДНЕЙ</code><br/>
                      Результат: <code className="text-xs">Подшипник ступицы ЗАДНЕЙ</code>
                    </li>
                    <li>
                      Ввод: <code className="text-xs">M-TEX</code><br/>
                      Результат: <code className="text-xs">"M-TEX"</code>
                    </li>
                    <li>
                      Ввод: <code className="text-xs">VW</code>, модель: <code className="text-xs">passat B5</code><br/>
                      Результат: <code className="text-xs">VW Passat B5 74-&quot;97</code>
                    </li>
                    <li>
                      Год: <code className="text-xs">1974</code> → <code className="text-xs">74</code><br/>
                      Год: <code className="text-xs">2024</code> → <code className="text-xs">24</code><br/>
                      Год: <code className="text-xs">05</code> → <code className="text-xs">05</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Спецификация масла (режим масел) */
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Спецификация масла</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {oilSpecConfigs.map(({ id, label, key, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <input
                        id={id}
                        type="text"
                        value={oilSpec[key]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOilSpecChange(key, e.target.value)}
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
              
              <div className="text-sm text-gray-500 mt-2">
                <p>Формат: Масло [тип] "[бренд]" [вязкость] [спецификация] [объем]</p>
                <p className="mt-1">Примеры ввода и результата:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    Ввод: Название: <code className="text-xs">Масло</code>, Брэнд: <code className="text-xs">Mobil</code><br/>
                    Спецификация: <code className="text-xs">Моторное "HYUNDAI/XTeer" 15w40 HD 7000 CI-4 1л</code><br/>
                    Результат: <code className="text-xs">Масло "Mobil" Моторное "HYUNDAI/XTeer" 15w40 HD 7000 CI-4 1л</code>
                  </li>
                  <li>
                    Ввод: Название: <code className="text-xs">Масло трансмиссионное</code>, Брэнд: <code className="text-xs">Castrol</code><br/>
                    Спецификация: <code className="text-xs">Трансмиссионное "Castrol" 75w90 GL-4 4л</code><br/>
                    Результат: <code className="text-xs">Масло трансмиссионное "Castrol" Трансмиссионное "Castrol" 75w90 GL-4 4л</code>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

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
              
              {/* Уведомление об успешном копировании */}
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
                          <p className="mt-1 text-xs">
                            • - видимый символ для пробела<br />
                            <span className="bg-red-200 px-1 rounded">красный фон</span> - двойные пробелы
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                'Заполните поля выше, чтобы увидеть результат...'
              )}
            </div>
            {concatenatedResult && concatenatedResult !== 'Пожалуйста, исправьте ошибки валидации' && !hasDoubleSpaces && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Пример полного ввода:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {mode === 'parts' ? (
                    <>
                      <li>Название: <code className="text-xs">подшипник ступицы ЗАДНЕЙ</code></li>
                      <li>Брэнд: <code className="text-xs">M-TEX</code></li>
                      <li>Марка авто: <code className="text-xs">VW</code></li>
                      <li>Модель: <code className="text-xs">passat B5</code></li>
                      <li>Год от: <code className="text-xs">1974</code></li>
                      <li>Год до: <code className="text-xs">1997</code></li>
                      <li className="font-medium">Результат: <code className="text-xs">Подшипник ступицы ЗАДНЕЙ &quot;M-TEX&quot; VW Passat B5 74-&gt;97</code></li>
                    </>
                  ) : (
                    <>
                      <li>Название: <code className="text-xs">Масло</code></li>
                      <li>Брэнд: <code className="text-xs">Mobil</code></li>
                      <li>Тип масла: <code className="text-xs">Моторное</code></li>
                      <li>Брэнд масла: <code className="text-xs">HYUNDAI/XTeer</code></li>
                      <li>Вязкость: <code className="text-xs">15w40</code></li>
                      <li>Спецификация: <code className="text-xs">HD 7000 CI-4</code></li>
                      <li>Объем: <code className="text-xs">1л</code></li>
                      <li className="font-medium">Результат: <code className="text-xs">Масло &quot;Mobil&quot; моторное &quot;HYUNDAI/XTeer&quot; 15w40 HD 7000 CI-4 1л</code></li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}