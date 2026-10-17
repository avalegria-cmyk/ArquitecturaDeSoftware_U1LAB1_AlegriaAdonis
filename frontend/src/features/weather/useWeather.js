import { useCallback, useEffect, useRef, useState } from 'react';
import { weatherApi } from '../../services/weatherApi';

export function useWeather() {
  const [model, setModel] = useState({ trained: false });
  const [prediction, setPrediction] = useState(null);
  const [operation, setOperation] = useState('loading');
  const [error, setError] = useState(null);
  const sequence = useRef(0);

  const execute = useCallback(async (name, action, onSuccess) => {
    const id = ++sequence.current;
    setOperation(name);
    setError(null);
    try {
      const result = await action();
      if (id === sequence.current) onSuccess(result);
    } catch (problem) {
      if (id === sequence.current) setError(problem);
    } finally {
      if (id === sequence.current) setOperation(null);
    }
  }, []);

  const refresh = useCallback(() => execute('loading', weatherApi.getModel, (result) => {
    setModel(result);
    setPrediction(null);
  }), [execute]);

  useEffect(() => {
    refresh();
    return () => { sequence.current += 1; };
  }, [refresh]);

  const train = (file) => execute('training', () => weatherApi.train(file), (result) => {
    setModel(result);
    setPrediction(null);
  });
  const predict = (values) => {
    setPrediction(null);
    return execute('predicting', () => weatherApi.predict(values, model.model_id), setPrediction);
  };

  return { model, prediction, operation, error, refresh, train, predict, clearPrediction: () => setPrediction(null) };
}
