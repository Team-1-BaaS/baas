import { Request, Response, NextFunction } from "express";
import { removeOne, removeSome, removeAll } from "../models/dbmethods";

export const one = async (req: Request, res: Response, next: NextFunction) => {
   try {
    const id = req.params.id;
    const collection = String(req.query.collection);

    const result = await removeOne(collection, id);
    res.json(result);
  } catch (error) {
    console.log(error) // ERROR HANDLING LATER
  }
};

const formatFilter = (query: Record<string, any>) => {
  const filter: Record<string, any> = {};
  
  Object.keys(query).forEach(key => {
    if (key.includes('[') && key.includes(']')) {
      // Handle operators like price[gte]=100
      const [field, operator] = key.split('[');
      const op = operator.replace(']', '');
      
      if (!filter[field]) filter[field] = {};
      
      let value = query[key];
      
      // Handle different operators
      switch(op) {
        case 'gte':
        case 'gt':
        case 'lte':
        case 'lt':
          filter[field][`$${op}`] = Number(value);
          break;
        case 'in':
        case 'nin':
          filter[field][`$${op}`] = value.split(',');
          break;
        case 'regex':
          filter[field].$regex = value;
          filter[field].$options = 'i'; // case insensitive
          break;
      }
    } else {
      // Direct field match
      if (query[key] === 'true') {
        filter[key] = true;
      } else if (query[key] === 'false') {
        filter[key] = false;
      } else {
        filter[key] = query[key];
      }
    }
  });
  
  return filter;
};

export const some = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collection, ...filter } = req.query;
    const formattedFilter = formatFilter(filter);
    const result = await removeSome(String(collection), formattedFilter);
    res.json(result);
  } catch (error) {
    console.error(error); // ADD ERROR HANDLING LATER
  }
};

export const all = async (req: Request, res: Response, next: NextFunction) => {
 try {
    const collection = String(req.query.collection);

    const result = await removeAll(collection);
    res.json(result);
  } catch (error) {
    console.log(error) // ERROR HANDLING LATER
  }
};
